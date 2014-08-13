module WabbitHoles
  class Article
    def initialize(title)
      @title = title
    end

    def to_hash
      { title: @title, content: "..." }
    end
  end
end
