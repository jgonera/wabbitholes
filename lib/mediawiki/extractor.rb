require "nokogiri"

module Mediawiki
  class LinkExtractor
    def initialize(html)
      @doc = Nokogiri::HTML(html)
      @doc.css('.hatnote, .infobox, .metadata, .thumb').remove
    end

    def wikilinks
      links = {}

      @doc.css('a[href^="/wiki/"]').each do |link|
        links[link["title"]] = true
      end

      links.keys
    end
  end
end
