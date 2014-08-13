require "mediawiki/api"
require "mediawiki/extractor"
require "grok/api"

module WabbitHoles
  class TsvTrailSource
    def initialize(tsv_file)
      @data = {}
      File.open(tsv_file, "r") do |f|
        lines = f.lines
        # skip header
        lines.next
        lines.each do |line|
          source, target, hits = line.split("\t")
          @data[source] ||= []
          @data[source] << { target: target, hits: hits }
        end
      end
    end

    # return the most popular linked article in given article
    def hole(title)
      @data[title].sort! { |a, b| a[:hits] <=> b[:hits] }
      @data[title].last[:target]
    end
  end
end
