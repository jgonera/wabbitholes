$: << File.expand_path(File.dirname(__FILE__) + "/../lib")
require "wabbit_holes/hole"
require "wabbit_holes/tsv_trail_source"

hole = WabbitHoles::Hole.new(ARGV[1], trail_source: WabbitHoles::TsvTrailSource.new(ARGV[0]))
puts hole.fall
