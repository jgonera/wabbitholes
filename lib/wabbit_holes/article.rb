require 'mediawiki/api'

module WabbitHoles
  class Article
    def initialize(title)
      api = Mediawiki::Api.new("http://en.wikipedia.org/w/api.php")
      extract = api.get_extract(title.gsub("_", " "))
      @title = extract["title"]
      @extract = extract["extract"]
    end

    def to_hash
      { "title" => @title, "extract" => @extract }
    end
  end
end
