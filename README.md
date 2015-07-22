## Usage ##

For a live example, simply load the `index.html` file.

Otherwise, the following code will display an rna
diagram of the structure `((..((....)).(((....))).))`.

```
    var svgWidth = 200;
    var svgHeight = 200;

    var rna1 = {'structure': '((..((....)).(((....))).))',
                'sequence': 'CGCUUCAUAUAAUCCUAAUGACCUAU'
    };

    var chart = rnaPlot()
    .width(svgWidth)
    .height(svgHeight)

    d3.select('body')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)


    svg.selectAll('.rna')
    .data([rna1])
    .enter()
    .append('g')
    .classed('rna', true)
    .call(chart);
```

Like this:

![Screenshot of a simple rna-plot](/doc/img/simple-rnaplot-example.png?raw=true "Simple rna-plot example")
