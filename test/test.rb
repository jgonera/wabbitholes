$: << File.expand_path(File.dirname(__FILE__) + "/../lib")
require "mediawiki/api"
require "mediawiki/info"
require "mediawiki/extractor"
require "grok/api"

#api = Mediawiki::Api.new("http://en.wikipedia.org/w/api.php")
#extractor = Mediawiki::LinkExtractor.new(api.get_lead_section("Surrealism"))
#grok_api = Grok::Api.new("http://stats.grok.se/json/en")

#puts extractor.wikilinks
#puts grok_api.latest_30_total("Cat")
#puts api.get_article_data("Surrealism")

info = Mediawiki::Info.new("Science")
puts info.page_creator
puts info.started_by_anonymous?
puts info.distinct_authors
puts info.creation_date
puts info.creation_month_year
