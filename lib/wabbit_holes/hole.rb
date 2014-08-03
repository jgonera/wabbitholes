require "wabbit_holes/article"

module WabbitHoles
  class Hole
    def initialize(title, depth: 12)
      @title = title
      @depth = depth
    end

    def fall
      current_title = @title
      articles = []

      @depth.times do
        puts current_title
        article = Article.new(current_title)
        # FIXME: suboptimal, not needed after last article
        current_title = article.hole

        articles << article.to_hash
      end

      articles
    end
  end
end
