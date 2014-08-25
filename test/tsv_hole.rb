$: << File.expand_path(File.dirname(__FILE__) + "/../lib")
require "wabbit_holes/hole"
require "wabbit_holes/tsv_source"
require "mediawiki/api"
require "mediawiki/info"
require "yaml"

api = Mediawiki::Api.new("http://en.wikipedia.org/w/api.php")
hole = WabbitHoles::Hole.new(ARGV[1], source: WabbitHoles::TsvSource.new(ARGV[0]))
puts YAML.dump({
  "context" => "Featured article on some day on English Wikipedia.",
  "articles" => hole.fall.map do |title|
    # FIXME: put all this in Hole (!)
    article_data = api.get_article_data(title.gsub("_", " "))
    # use article_data["title"] instead of title in case it's a redirect
    info = Mediawiki::Info.new(article_data["title"])
    article_data["started_by_anonymous"] = info.started_by_anonymous?
    article_data["distinct_authors"] = info.distinct_authors
    article_data["creation_date"] = info.creation_month_year

    article_data
  end
})
puts "---"
