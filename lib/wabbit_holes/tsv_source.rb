require "uri"

module WabbitHoles
  class TsvSource
    def initialize(tsv_file)
      @tsv_file = tsv_file
    end

    # return the most popular linked article in given article
    def hole(title, n=0)
      targets = get_targets(title)
      return nil if targets.empty?
      targets.sort! { |a, b| b[:hits] <=> a[:hits] }[n][:target]
    end

    protected

    def get_targets(title)
      targets = []

      # this is much faster than iterating over lines of the whole file in Ruby
      `cat #{@tsv_file} | grep "^#{URI.escape(title)}\\s"`.split("\n").each do |line|
        source, target, hits = URI.unescape(line).split("\t")
        if source == title && !/^File:|\(disambiguation\)$/.match(target)
          targets << { target: target, hits: hits.to_i }
        end
      end

      targets
    end
  end
end
