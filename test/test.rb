$: << File.expand_path(File.dirname(__FILE__) + "/../lib")
require "mediawiki/api"
require "mediawiki/extractor"
require "grok/api"

api = Mediawiki::Api.new("http://en.wikipedia.org/w/api.php")
extractor = Mediawiki::LinkExtractor.new(api.get_lead_section("Cat"))
grok_api = Grok::Api.new("http://stats.grok.se/json/en")

puts extractor.wikilinks
puts grok_api.latest_30_total("Cat")
