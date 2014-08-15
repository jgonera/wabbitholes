$: << File.expand_path(File.dirname(__FILE__) + "/../lib")
require "wabbit_holes/hole"
require "yaml"

hole = WabbitHoles::Hole.new(ARGV[0])
puts "---"
puts YAML.dump({
  "context" => "Featured article on some day on English Wikipedia.",
  "articles" => hole.fall
})
puts "---"
