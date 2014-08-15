require "wabbit_holes/grok_source"

module WabbitHoles
  class Hole
    def initialize(title, depth: 12, source: GrokSource.new)
      @title = title
      @depth = depth
      @source = source
    end

    def fall
      current_title = @title
      titles = []

      @depth.times do
        STDERR.puts current_title
        titles << current_title
        n = 0

        loop do
          possible_title = @source.hole(current_title, n)
          n += 1
          unless titles.include?(possible_title)
            current_title = possible_title
            break
          end
        end
      end

      titles
    end
  end
end
