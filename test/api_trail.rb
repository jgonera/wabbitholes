$: << File.expand_path(File.dirname(__FILE__) + "/../lib")
require "wabbit_holes/hole"

hole = WabbitHoles::Hole.new(ARGV[0])
puts hole.fall
