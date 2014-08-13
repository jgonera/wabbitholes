module WabbitHoles
  class TsvTrailSource
    def initialize(tsv_file)
      @tsv_file = tsv_file
    end

    # return the most popular linked article in given article
    def hole(title)
      targets = get_targets(title)
      return nil if targets.empty?
      targets.sort! { |a, b| b[:hits] <=> a[:hits] }.first[:target]
    end

    protected

    def get_targets(title)
      targets = []

      # this is much faster than iterating over lines of the whole file in Ruby
      `cat #{@tsv_file} | grep "^#{title}\\s"`.split("\n").each do |line|
        source, target, hits = line.split("\t")
        targets << { target: target, hits: hits.to_i } if source == title
      end

      targets
    end
  end
end
