require "mediawiki/api"
require "mediawiki/extractor"
require "grok/api"

module WabbitHoles
  class Article
    def initialize(title)
      @title = title

      @api = Mediawiki::Api.new("http://en.wikipedia.org/w/api.php")
    end

    # return the most popular linked article in give article
    def hole
      articles = {}
      extractor = Mediawiki::LinkExtractor.new(@api.get_lead_section(@title))
      grok_api = Grok::Api.new("http://stats.grok.se/json/en")

      extractor.wikilinks.each do |title|
        articles[title] = grok_api.latest_30_total(title)
        puts "link: #{title}\t#{articles[title]}"
      end

      articles.max_by { |k, v| v }.first
    end

    def to_hash
      { title: @title, content: "..." }
    end
  end
end
