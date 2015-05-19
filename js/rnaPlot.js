function rnaPlot() {
    var width = 400,
    height = 400,
    labelInterval = 0,
    uids = [],
    positions = [];

    function chart(selection) {
        selection.each(function(data) {
            // data should be a dictionary containing at least a structure
            // and possibly a sequence
            rg = new RNAGraph(data.sequence, data.structure, data.name);
            rnaJson = rg.recalculateElements();

            if (positions.length === 0) {
                // no provided positions means we need to calculate an initial layout
                positions = simple_xy_coordinates(rnaJson.pairtable);
            }

            var g = data.select(".rnaChart");

            console.log('positions', positions);

            g.selectAll('.rnaBase')
            .data(positions)
            /*
            .append('svg:circle')
            .attr('r', 6)
            .attr('cx', 
            */
        });
    }

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    return chart;
}
