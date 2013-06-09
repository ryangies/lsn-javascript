#!/usr/bin/perl
use strict;
use Data::Hub qw($Hub);
use Perl::Module;

my $ARGS = $$Hub{'/sys/ARGV'};
my $OPTS = $$Hub{'/sys/OPTS'};

my $re = qr/^\/\*+\!(.*?)\*\//s;

foreach my $a (@$ARGS) {

  my $text = $$Hub{$a}->get_content; 

  if (my ($comment) = $$text =~ $re) {
    my @lines = split /\r?\n\r?/, $comment;
    foreach my $line (@lines) {
      $line =~ s/^[\s*]+//gm;
      $line =~ s/[\s*]+^//gm;
      next unless $line;
      printf "%s: %s\n", $a, $line;
    }
  }

}
