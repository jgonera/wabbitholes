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

    def get_article_data(title)
      resp = @conn.get "", {
        format: "json",
        action: "query",
        redirects: true,
        prop: "extracts|pageimages",
        titles: title,
        exintro: true,
        explaintext: true,
        exsentences: 10,
        piprop: "thumbnail",
        # one of MultimediaViewer buckets, avoid generating new sizes
        # 320, 640, 800, 1024, 1280, 1920, 2560, 2880
        pithumbsize: 1024
      }

      data = JSON.parse(resp.body)["query"]["pages"].values.first
      {
        "title" => data["title"],
        "extract" => data["extract"],
        "image_url" => data.has_key?("thumbnail") ? data["thumbnail"]["source"] : nil
      }
    end
  end
end
