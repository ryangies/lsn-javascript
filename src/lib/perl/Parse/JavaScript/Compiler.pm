package Parse::JavaScript::Compiler;
use strict;
use Perl::Module;
use Error::Logical;
use Data::Hub::Util qw(:all);
use Data::Hub::FileSystem::HashFile;
use Data::Hub::Container;
use Parse::Template::Standard;
use Parse::JavaScript::Doc qw(def_to_vim);
use File::Temp;
use Time::Piece;
use App::Console::Color qw(c_sprintf c_printf);

our $Minimize_Cmd = 'lsn-jsmin';

our $Value_Parser = Parse::Template::Standard->new(
  -begin => '${',
  -end => '}'
);

sub new {
  my $classname = ref($_[0]) ? ref(shift) : shift;
  my $self = bless {
    @_,
    latest_source_mtime => 0,
    last_compiled_mtime => 0,
    file_list => [],
  }, $classname;
  $self->init();
}

sub build_file_list {
  my $self = shift;
  @{$self->{file_list}} = ();
  my $files = $self->{conf}->get('files');
  $files = Data::Hub::Container->new([$files]) unless ref $files;
  for ($files->values) {
    for ($self->{hub}->list($_)->values) {
      push @{$self->{file_list}}, $_;
    }
  }
}

sub init {
  my $self = shift;
  if (my $mounts = $self->{conf}{mounts}) {
    foreach my $mp (keys %$mounts) {
      $self->{hub}->mount($mp, $self->path_localize($mounts->{$mp}));
    }
  }
  $self->{parser} = Parse::Template::Standard->new(
    $self->{hub},
    -begin=>'{#',
    -end=>'}'
  );
  $self->{parser}->use($self->{conf});
  my $target = $self->get_conf_path('target');
  my $stat = stat $target;
  $self->{last_compiled_mtime} = $stat ? int($stat->mtime) : 0;
  $self->build_file_list();
  $self;
}

sub has_modified {
  my $self = shift;
  $self->refresh();
  $self->{latest_source_mtime} > $self->{last_compiled_mtime};
}

sub refresh {
  my $self = shift;
  $self->{hub}->expire();
  $self->{conf}->expire();
  $self->{conf}->refresh();
  $self->build_file_list();
  $self->{latest_source_mtime} = 0;
  foreach my $file (@{$self->{file_list}}) {
    my $file_mtime = $file->get_mtime() || 0;
    $self->{latest_source_mtime} =
      max($self->{latest_source_mtime}, $file_mtime);
    $self->{verbose} and warnf " %d: %s\n", $file->get_mtime(), $file->get_addr();
  }
  $self->{latest_source_mtime} =
    max($self->{latest_source_mtime}, $self->{conf}->get_mtime);
  $self;
}

sub compile {
  my $self = shift;
  my $js_text = Data::OrderedHash->new();
  my $out = {};
  my $doc = Parse::JavaScript::Doc->new();
  my $target = $self->get_conf_path('target');
  my $doc_target = $self->get_conf_path('doc_target');
  my $vim_target = $self->get_conf_path('vim_target');
  foreach my $file (@{$self->{'file_list'}}) {
    my $fn = path_name($file->get_path);
    my $out = '';
    my $addr = $file->get_addr;
    $self->{'verbose'} and warn $file->get_path(),"\n";
    $self->{'parser'}->compile($addr, -out=>\$out);
    $self->check_syntax($out, $file);
    my $uniq = '';
    my $basename = path_basename($fn);
    my $ext = path_ext($fn);
    my $key = "$basename$uniq.$ext";
    while ($$js_text{$key}) {
      $uniq++;
      $key = "$basename$uniq.$ext";
    }
    $self->{verbose} and $out .= "\ntry{console.log('Loaded: $key');}catch(ex){}\n";
    # Remove /// comments when debugging
    $self->{debug} and $out =~ s!^(\s+)/{3}([^/])!$1$2!gm;
    $self->{debug} and $out =~ s!^/{3}(\s+)!   $1!gm;
    $self->{debug} and $out =~ s!^/{3}([^\s/])!$1!gm;
    $$js_text{$key} = $out;
    if ($doc_target && ($self->{'build_docs'} || $self->{'build_vim'})) {
      my $text = $out; # After compile
      $doc->parse(\$text)
    }
  }
  my @comments = ();
  my $target_text = '';
  my $dbg_out_base = path_parent($target);
  $dbg_out_base and $dbg_out_base .= '/';
  my $dbg_out_basename = addr_name($target);
  $dbg_out_base .= $dbg_out_basename;
  foreach my $key (keys %$js_text) {
    my $dbg_out_path = "$dbg_out_base-$key";
    if ($self->{'debug'}
        && $self->{'debug'} ne 1
        && ($self->{'debug'} eq 'all' || $key =~ /$self->{debug}/)) {
      # Write the output to its debug location
      file_write($dbg_out_path, $$js_text{$key});
      $self->printout("Wrote:", $dbg_out_path);
      # Insert the document.write statement
      my $target_url = $self->{conf}{target_url};
      my $jssrc = $target_url
        ? addr_normalize("$target_url/$dbg_out_basename-$key")
        : "[#`./$dbg_out_basename-$key`]";
      my $fmt = '<script type="text/javascript" src="%s"></script>';
      my $elem = sprintf($fmt, $jssrc);
      $target_text .= sprintf("document.write('%s');\n", $elem);
    } else {
      #
      # Not debug, compress the output
      #
      if (-e $dbg_out_path) {
        # A previous compile had the debug switch, clean up
        $self->printout("Removed:", $dbg_out_path);
        file_remove($dbg_out_path)
      }
      my $content = $$js_text{$key};
      # 
      # If the file begins with a comment section like:
      #
      #   /*!
      #    * ...
      #    */
      #
      # then consider it to be a license comment which needs to be present in
      # the compiled result.
      #
      my $re = qr/\/\*+\!(.*?)\*\//s;
      if (my ($comment) = $content =~ $re) {
        my @cbody = ();
        my @lines = split /\r?\n\r?/, $comment;
        foreach my $line (@lines) {
          $line =~ s/^[\s*]+//gm;
          $line =~ s/[\s*]+^//gm;
          next unless $line;
          push @cbody, $line;
        }
        @cbody and push @comments, join(' ', @cbody);
      }
      $target_text .= $content . "\n";
    }
  }
  if ($self->{'debug'}) {
    file_write($target, $target_text);
    $self->printout("Wrote:", $target);
  } else {
    my $copyright = $self->{'conf'}{'copyright'};
    unshift @comments, $copyright if $copyright;
    my $headline = join ';', @comments;
    $headline =~ s/(?<!\\)'//g;
    my $tmp = File::Temp->new();
    binmode $tmp, ':utf8';
    print $tmp $target_text;
    `cat $tmp | $Minimize_Cmd '$headline' > $target`;
    $self->printout("Wrote:", $target);
  }
  if ($doc_target && $self->{'build_docs'}) {
    my $hf = Data::Hub::FileSystem::HashFile->new($doc_target);
    $hf->set_data($doc->sort);
    $hf->save();
    $self->printout("Wrote:", $doc_target);
  }
  if ($vim_target && $self->{build_vim}) {
    my $out = "let g:autoc_list = [\n";
    my $defs = $doc->sort->{defs};
    $out .= sprintf "\\{%s},\n", def_to_vim($_) for @$defs;
    $out .= sprintf "\\{%s},\n", def_to_vim($_, 'ecma') for @$defs;
    $out .= "\\]";
    file_write($vim_target, \$out);
    $self->printout("Wrote:", $vim_target);
  }
  $self->{last_compiled_mtime} = $self->{latest_source_mtime};
}

sub check_syntax {
  my $self = shift;
  my $text = shift;
  my $file = shift;
  $text =~ /,\s*[})][\s)]*[;}]/s and do {
    my $match = $&;
    my $pre = substr $`, -20;
    my $post = substr $', 0, 5;
    my $line_no = ($` =~ y/\n/\n/) + 1;
    my $path = $file->get_path;
    my $msg = c_sprintf "%s%_*s%s", $pre, $match, $post;
    $msg =~ s/\n/\\n/g;
    $self->printout('Warning:', "trailing comma found:");
    $self->printout('   path:', $path);
    $self->printout('   line:', $line_no);
    $self->printout('   text:', $msg);
    return 0;
  };
  1;
}

sub path_localize {
  my $self = shift;
  my $rel_path = shift;
  my $ctx_path = $self->{'build_dir'};
  return $rel_path if path_is_absolute($rel_path);
  path_normalize("$ctx_path/$rel_path");
}

sub get_conf_path {
  my $self = shift;
  my $key = shift;
  my $value = $self->{'conf'}{$key} or return;
  $value = $Value_Parser->compile_text(\$value, \%ENV, @_);
  $self->path_localize($$value);
}

sub printout {
  my $self = shift;
  my $t = localtime;
  my $tstr = $t->strftime('%D %T');
  my $arg1 = shift;
  my $arg2 = join(' ', @_);
  c_printf \*STDERR, "[%_bs] %_rs %s\n", $tstr, $arg1, $arg2;
}

1;
