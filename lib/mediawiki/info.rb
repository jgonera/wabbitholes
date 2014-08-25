require "faraday"
require "nokogiri"
require "date"

module Mediawiki
  class Info
    def initialize(title)
      @conn = Faraday.new(url: "http://en.wikipedia.org/w/index.php") do |faraday|
        faraday.request :url_encoded
        #faraday.response :logger
        faraday.adapter Faraday.default_adapter
      end

      resp = @conn.get "", {
        title: title,
        action: "info"
      }
      @doc = Nokogiri::HTML(resp.body)
    end

    def page_creator
      @doc.css("#mw-pageinfo-firstuser .mw-userlink").text
    end

    def started_by_anonymous?
      # example: "137.111.13.xxx"
      !!(page_creator =~ /\d{1,3}\.\d{1,3}\.\d{1,3}\..{1,3}/)
    end

    def distinct_authors
      @doc.css("#mw-pageinfo-authors td")[1].text
    end

    def creation_date
      DateTime.parse(@doc.css("#mw-pageinfo-firsttime td")[1].text)
    end

    def creation_month_year
      "#{DateTime::MONTHNAMES[creation_date.month]} #{creation_date.year}"
    end
  end
end
