$: << File.expand_path(File.dirname(__FILE__) + "/../lib")
require "wabbit_holes/hole"
require "wabbit_holes/tsv_source"
require "mediawiki/api"
require "yaml"

api = Mediawiki::Api.new("http://en.wikipedia.org/w/api.php")
hole = WabbitHoles::Hole.new(ARGV[1], source: WabbitHoles::TsvSource.new(ARGV[0]))
puts YAML.dump({
  "context" => "Featured article on some day on English Wikipedia.",
  "articles" => hole.fall.map { |title| api.get_article_data(title.gsub("_", " ")) }
})
puts "---"
