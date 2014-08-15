require "wabbit_holes/article"
require "wabbit_holes/api_trail_source"

module WabbitHoles
  class Hole
    def initialize(title, depth: 12, trail_source: ApiTrailSource.new)
      @title = title
      @depth = depth
      @trail_source = trail_source
    end

    def fall
      current_title = @title
      articles = []
      titles = []

      @depth.times do
        STDERR.puts current_title
        article = Article.new(current_title)
        titles << current_title
        n = 0

        loop do
          possible_title = @trail_source.hole(current_title, n)
          n += 1
          unless titles.include?(possible_title)
            current_title = possible_title
            break
          end
        end

        articles << article.to_hash
      end

      articles
    end
  end
end
