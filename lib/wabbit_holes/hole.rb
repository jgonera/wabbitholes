require "wabbit_holes/article"
require "wabbit_holes/api_trail_source"

module WabbitHoles
  class Hole
    def initialize(title, depth: 12, trail_source: ApiTrailSource)
      @title = title
      @depth = depth
      @trail_source = ApiTrailSource.new
    end

    def fall
      current_title = @title
      articles = []

      @depth.times do
        puts current_title
        article = Article.new(current_title)
        # FIXME: suboptimal, not needed after last article
        current_title = @trail_source.hole(current_title)

        articles << article.to_hash
      end

      articles
    end
  end
end
