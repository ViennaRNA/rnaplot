function rnaTreemapChart() {
    var width = 550;
    var height = 400;

    function rnaTreemapNode(selection) {
        // create a background rectangle for each RNA structure
        selection.each(function(d) {
            d3.select(this)
            .attr('transform', function(d) { return 'translate(' + d.x + "," + d.y + ')' })
            .append('rect')
            .classed('structure-background-rect', true)
            .attr("width", function(d) { return Math.max(0, d.dx); })
            .attr("height", function(d) { return Math.max(0, d.dy); })

            // draw the actual RNA structure
            var chart = rnaPlot()
            .width( Math.max(0, d.dx))
            .height( Math.max(0, d.dy))
            .labelInterval(0)
            .rnaEdgePadding(10)
            .showNucleotideLabels(false);

            if ('structure' in d) d3.select(this).call(chart)

        });
    }

    var chart = function(selection) {
        selection.each(function(data) {
            // initialize the treemap structure
            // sample input
            // { 'name': 'blah',
            // 'children: [{'structure': '..((..))',
            //               'sequence': 'ACCGGCC',
            //               'size': 50}]
            // }
            var treemap = d3.layout.treemap()
            .size([width, height])
            .sticky(false)
            .value(function(d) { return d.size; });

            // create an svg element
            var svg = d3.select(this).selectAll("svg").data([data]);
            // Otherwise, create the skeletal chart.
            var gEnter = svg.enter().append("svg")
            .attr('width', width)
            .attr('height', height)
            .append("g");


            // create a new <g> for each node in the treemap
            var treemapGnodes = gEnter.datum(root[0]).selectAll(".treemapNode")
            .data(treemap.nodes)
            .enter()
            .append('g')
            .attr('class', 'treemapNode')
            .call(rnaTreemapNode);

        });
    };

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    }

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    }

    return chart;
}
