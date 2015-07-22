## Usage ##

For a live example, simply load the `index.html` file.

Otherwise, the following code will display an rna
diagram of the structure `((..((....)).(((....))).))`.

```
<!DOCTYPE html>
<meta charset="utf-8">
 <link rel='stylesheet' type='text/css' href='css/d3-rnaplot.css' />

This is an RNA container.
<div id='rna_ss'> </div>
This after the RNA container.

<script type='text/javascript' src='js/d3.js'></script>
<script type='text/javascript' src='js/d3-rnaplot.js'></script>
<script type='text/javascript'>

var svgWidth = 200;
var svgHeight = 200;

var rna1 = {'structure': '((..((....)).(((....))).))',
            'sequence': 'CGCUUCAUAUAAUCCUAAUGACCUAU'
};

var chart = rnaPlot()
.width(svgWidth)
.height(svgHeight)

var svg = d3.select('#rna_ss')
.append('svg')
.attr('width', svgWidth)
.attr('height', svgHeight)


svg.selectAll('.rna')
.data([rna1])
.enter()
.append('g')
.classed('rna', true)
.call(chart);
</script>
```

Like this:

![Screenshot of a simple rna-plot](/doc/img/simple-rnaplot-example.png?raw=true "Simple rna-plot example")

#### Adding nucleotide number labels ####

```
var chart = rnaPlot()
.width(svgWidth)
.height(svgHeight)
.labelInterval(10);
```

![Showing nucleotide numbers](/doc/img/show-nucleotide-numbers.png?raw=true "Show nucleotide numbers")

#### Change the starting nucleotide number ####

Specify the number of the first nucleotide so that the
labelling is changed accordingly.

```
var chart = rnaPlot()
.width(svgWidth)
.height(svgHeight)
.startNucleotideNumber(7)
.labelInterval(5)
```

![Changed starting nucleotide number](/doc/img/start-nucleotide-number.png?raw=true "Changed starting nucleotide number")


#### Stupid Compiling ####

```
cat src/*.js > js/d3-rnaplot.js
```
