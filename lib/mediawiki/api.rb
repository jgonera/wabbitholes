require 'faraday'
require 'json'

module Mediawiki
  class Api
    def initialize(url)
      @conn = Faraday.new(url: url) do |faraday|
        faraday.request :url_encoded
        #faraday.response :logger
        faraday.adapter Faraday.default_adapter
      end
    end

    def get_lead_section(title)
      resp = @conn.get "", {
        format: 'json',
        action: 'mobileview',
        page: title,
        redirect: 'yes',
        prop: 'text',
        noheadings: 'yes',
        sections: 0
      }

      JSON.parse(resp.body)["mobileview"]["sections"][0]["text"]
    end

    # TODO: accept multiple titles?
    def get_extract(title)
      resp = @conn.get "", {
        format: "json",
        action: "query",
        redirects: true,
        prop: "extracts",
        titles: title,
        exintro: true,
        explaintext: true,
        exsentences: 2
      }

      JSON.parse(resp.body)["query"]["pages"].values.first
    end
  end
end
