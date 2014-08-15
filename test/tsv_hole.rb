$: << File.expand_path(File.dirname(__FILE__) + "/../lib")
require "wabbit_holes/hole"
require "wabbit_holes/tsv_source"
require "yaml"

hole = WabbitHoles::Hole.new(ARGV[1], source: WabbitHoles::TsvSource.new(ARGV[0]))
puts YAML.dump({
  "context" => "Featured article on some day on English Wikipedia.",
  "articles" => hole.fall
})
puts "---"
