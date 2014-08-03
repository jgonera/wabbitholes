require 'faraday'
require 'json'
require 'uri'

module Grok
  class Api
    def initialize(url)
      @conn = Faraday.new(url: url) do |faraday|
        faraday.request :url_encoded
        #faraday.response :logger
        faraday.adapter Faraday.default_adapter
      end
    end

    def latest_30_total(title)
      resp = @conn.get URI.escape("latest30/#{title}")

      JSON.parse(resp.body)["daily_views"].values.inject(:+)
    end
  end
end
