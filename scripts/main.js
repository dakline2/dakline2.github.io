//
// Doug Kline
// University of Illinois Urbana Champaign
// CS #498 Data Viz
// Final Project
// 2018-07-29
//
//
// Used data from Randi H Griffin on Kaggle for 120 years of Olympic history.
// This dataset was converted to the olympics.csv file which aggregated the gold/silver/bronze
// medals counts for each winter/summer Olympics. The purpose of this final project was
// to learn Javascript and D3, so while the medal counts themselve are not all that
// insightful, the dataset was sufficient to do a D3 narative visualization.
//
// Used example code from Mike Bostock (https://bl.ocks.org/mbostock/4062085)
// and http://learnjsdata.com/read_data.html on how to read in and use
// a csv file.
//
// Heavily used code from Mike Bostock ( http://bl.ocks.org/mbostock/3943967)
// on how to do a stack bar chart and switch to a side-by-side bar chart including
// transitions.
//
// Used example code from d3noob (https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e)
// on how to label the x and y axis.
//
// Used example code from JS Bin (http://output.jsbin.com/ubafur/3) which was pointed to
// in (https://stackoverflow.com/questions/13573771/adding-a-chart-legend-in-d3) to add
// a legend to the chart.
//
// Other references may be cited in the code.
//
   

// Read in data from csv file
// Example: https://bl.ocks.org/mbostock/4062085
// Example: http://learnjsdata.com/read_data.html
d3.csv("data/olympics.csv", function(error, data) {

   var num_medals = 3; // Gold, Silver, Bronze
   var num_games  = 38; // From 1896 to 2016, every four years
                        // Note: starting with 1994, the summer and winter games
                        // are staggered every two years
   
   var year = [];
   var city = [];
   var gold = [];
   var silver = [];
   var bronze = [];
   var summergold = [];
   var summersilver = [];
   var summerbronze = [];
   var wintergold = [];
   var wintersilver = [];
   var winterbronze = [];

   for (i = 0; i < num_games; i++) {
      year[i]         =  parseInt(data[i].Year);
      city[i]         =  data[i].City;
      gold[i]         =  parseInt(data[i].Gold);
      silver[i]       =  parseInt(data[i].Silver);
      bronze[i]       =  parseInt(data[i].Bronze);
      summergold[i]   =  parseInt(data[i].SummerGold);
      summersilver[i] =  parseInt(data[i].SummerSilver);
      summerbronze[i] =  parseInt(data[i].SummerBronze);
      wintergold[i]   =  parseInt(data[i].WinterGold);
      wintersilver[i] =  parseInt(data[i].WinterSilver);
      winterbronze[i] =  parseInt(data[i].WinterBronze);
   }

   // All the data is read in

   var medals_combined = d3.range(num_medals).map(function(d) { 
	    switch(d) {
	      case 0: return bronze;
	      case 1: return silver;
	      case 2: return gold;
            }});

   var medals_summer = d3.range(num_medals).map(function(d) { 
	    switch(d) {
	      case 0: return summerbronze;
	      case 1: return summersilver;
	      case 2: return summergold;
            }});

   var medals_winter = d3.range(num_medals).map(function(d) { 
	    switch(d) {
	      case 0: return winterbronze;
	      case 1: return wintersilver;
	      case 2: return wintergold;
            }});

   var medals_combined_stacked = d3.stack().keys(d3.range(num_medals))(d3.transpose(medals_combined));
   var medals_summer_stacked = d3.stack().keys(d3.range(num_medals))(d3.transpose(medals_summer));
   var medals_winter_stacked = d3.stack().keys(d3.range(num_medals))(d3.transpose(medals_winter));
   var medals_sideby = medals_combined;
   var medals_stacked = medals_combined_stacked;
	
   var annotation_color = "blue";
   
   // Scene state variable
   var chart_title, y_axis_label, scene_number;
   set_scene_1();

   // These should stay the same from graph to graph for consistency
   var medals_sideby_max = d3.max(medals_combined, function(y) { return d3.max(y); });
   var medals_stacked_max  = d3.max(medals_combined_stacked, function(y) { return d3.max(y, function(d) { return d[1]; }); });  

   //--------------------------------------------------------------------------
   //
   // About button
   // Example from: https://www.w3schools.com/howto/howto_css_modals.asp
   //--------------------------------------------------------------------------
   // Get the modal
   var modal = document.getElementById('myModal');

   // Get the button that opens the modal
   var btn = document.getElementById("about");

   // Get the <span> element that closes the modal
   var span = document.getElementsByClassName("close")[0];

   // When the user clicks on the button, open the modal
   btn.onclick = function() {
      modal.style.display = "block";
   }

   // When the user clicks on <span> (x), close the modal
   span.onclick = function() {
      modal.style.display = "none";
   }

   // When the user clicks anywhere outside of the modal, close it
   window.onclick = function(event) {
      if (event.target == modal) {
         modal.style.display = "none";
      }
   } 

   // end about button

   // Graph margins
   var margin = {top: 40, right: 10, bottom: 40, left: 70};

   //--------------------------------------------------------------------------
   //
   // Draw and re-draw the bar chart
   // 
   //--------------------------------------------------------------------------
   function draw_svg() {
      // Example: http://bl.ocks.org/mbostock/3943967
      
      var x_idx = d3.range(num_games);

      var svg = d3.select("svg");
      var width = +svg.attr("width") - margin.left - margin.right;
      var height = +svg.attr("height") - margin.top - margin.bottom;
      var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Start with the "Stacked" radio checked
      d3.select("input[value=\"stacked\"]").property("checked", true)

      var x = d3.scaleBand()
                .domain(x_idx)
                .rangeRound([0, width])
                .padding(0.2);

      // For year labeling
      var x2 = d3.scaleBand()
               .domain(year)
               .rangeRound([0, width])
               .padding(0.1);

      var y = d3.scaleLinear()
                .domain([0, medals_stacked_max])
                .range([height, 0]);

      // colors from http://www.99colors.net
      var color_list  = ['#CD7F32', '#C0C0C0', '#D4AF37'];
      var color_names = ['Bronze', 'Silver', 'Gold'];

      var color = d3.scaleOrdinal()
                    .domain(d3.range(num_medals))
                    .range(color_list);

      var series = g.selectAll(".series")
                    .data(medals_stacked)
                    .enter().append("g")
                    .attr("fill", function(d, i) { return color(i); });

      var rect = series.selectAll("rect")
                       .data(function(d) { return d; })
                       .enter().append("rect")
                       .attr("x", function(d, i) { return x(i); })
                       .attr("y", height)
                       .attr("width", x.bandwidth())
                       .attr("height", 0);

      rect.transition()
          .delay(function(d, i) { return i * 10; })
          .attr("y", function(d) { return y(d[1]); })
          .attr("height", function(d) { return y(d[0]) - y(d[1]); });

      // Handle the tooltip for host country name and metal count
      var tooltip = d3.select("#tooltip");

      rect.on("mouseover", function(d,i) {
         tooltip.style("opacity", 1)
                .style("left",(d3.event.pageX)+"px")
                .style("top",(d3.event.pageY)+"px")
                .html(year[i] + " " + city[i] + "<br>" + "Medal Count: " + (d[1]-d[0]))})
	       .on("mouseout", function() { 
	          tooltip.style("opacity", 0) });

      // Putting the numbers on the y-axis
      g.append("g")
       .attr("class", "axis axis--y")
       .call(d3.axisLeft(y)
       .tickSize(0)
       .tickPadding(6));

      // y-axis label
      // Example from https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e	
      svg.append("text")
         .attr("id", "y-label")
         .attr("transform", "rotate(-90)")
         .attr("y", margin.left - 50)  // rotate makes the y value the x value on the screen
         .attr("x", -(height / 2 + 30))
         .style("text-anchor", "middle")
         .text(y_axis_label);      


      // This is putting the numbers on the x-axis
      g.append("g")
       .attr("class", "axis axis--x")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x2)
       .tickSize(0)
       .tickPadding(6));

      // x-axis label
      // Example from https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e	
      svg.append("text")             
         .attr("transform",
               "translate(" + ((width/2)+40) + " ," + 
                          (height + margin.top + 35) + ")")
         .style("text-anchor", "middle")
         .text("Olympic Year");

      //-----------------------------------------------------------------------
      // Add a legend
      // Example: https://stackoverflow.com/questions/13573771/adding-a-chart-legend-in-d3
      // and used JS Bin's code at: http://output.jsbin.com/ubafur/3 
	   var legend = svg.append("g")
	                   .attr("class", "legend")
	                   .attr("height", 100)
	                   .attr("width", 100)
                      .attr('transform', 'translate(-20,50)')    

      legend.selectAll('rect')
            .data(medals_stacked)
            .enter()
            .append("rect")
	         .attr("x", 100 )
            .attr("y", function(d, i){ return (2-i) *  20;})
	         .attr("width", 10)
	         .attr("height", 10)
	         .style("fill", function(d) { 
            var color = color_list[medals_stacked.indexOf(d)];
         return color;
      })

      legend.selectAll('text')
            .data(medals_stacked)
            .enter()
            .append("text")
	         .attr("x", 120 )
            .attr("y", function(d, i){ return (2-i) *  20 + 9;})
	         .text(function(d) {
                var text = color_names[medals_stacked.indexOf(d)];
                return text;     
            });
      //-----------------------------------------------------------------------
               
      // Update the title
      var chart_heading = document.getElementById("mytitle");
      chart_heading.innerHTML = chart_title;

      // Add the scene annotation
      switch (scene_number) {
         case 1: annotate_scene_1(svg);
	           break;
         case 2: annotate_scene_2(svg);
              break;
         case 3: annotate_scene_3(svg);
              break;
      }

      return([svg, rect, x, y]);

   } // end  draw_svg()

   // Handle the first drawing
   var rtn = draw_svg();
   var svg  = rtn[0];
   var rect = rtn[1];
   var x    = rtn[2];
   var y    = rtn[3];



   //--------------------------------------------------------------------------
   // Handling the next/previous buttons

   document.getElementById("previous").onclick = function() {handle_previous()};
   document.getElementById("next").onclick = function() {handle_next()};

   
   //--------------------------------------------------------------------------
   function clear_annotations() {
      d3.select("#ww1").remove();  // scene 1
      d3.select("#ww2").remove();
      d3.select("#sw").remove();
      d3.select("#y1912").remove();
      d3.select("#y1920").remove();
      d3.select("#y1924").remove();
      d3.select("#count_incr").remove();
      d3.select("#winter_begin").remove();
      d3.select("#winter_less").remove();

   }
   
   //
   // TODO: These positions are all hardcoded. Switch to relative to year and 
   //       bar height.
   //

   //--------------------------------------------------------------------------
   function annotate_scene_1(svg) {
      clear_annotations();

      document.getElementById("scenenum").innerHTML = "1 of 3";

      svg.append("text")
         .attr("id", "ww1")
         .attr("x", margin.left + 110)
         .attr("y", margin.top  + 170)
         .style("text-anchor", "middle")
         .attr("fill", annotation_color)
         .text("World War 1");

      svg.append("text")
         .attr("id", "ww2")
         .attr("x", margin.left + 300)
         .attr("y", margin.top  + 170)
         .style("text-anchor", "middle")
         .attr("fill", annotation_color)
         .text("World War 2");

      svg.append("text")
         .attr("id", "sw")
         .attr("x", margin.left + 700)
         .attr("y", margin.top  - 10)
         .style("text-anchor", "middle")
         .attr("fill", annotation_color)
         .text("Summer/Winter Olympics are staggered every 2 years");

      // Add the scene annotation
      var annotate = document.getElementById("annotate");
      annotate.innerHTML = "This slide shows the total medal counts awarded to individuals per Olympic year. From 1924 to 1992 the Winter Olympics were held in the same year as summer, then the games were staggered every two years. The Olympics were suspended during the World War years. While each event awards gold/silver/bronze medals, there is some variation in the medal counts due to variation in team sizes, ties, retroactive disqualifications, etc.<br><br>The user may explore this using the Side-by-Side selection and can hover over the bars to see where the games where held and the medal counts.";

   }

   //--------------------------------------------------------------------------
   function annotate_scene_2(svg) {
      clear_annotations();

      document.getElementById("scenenum").innerHTML = "2 of 3";

      svg.append("text")
         .attr("id", "y1912")
         .attr("x", margin.left + 80)
         .attr("y", margin.top  + 188)
         .style("text-anchor", "middle")
         .attr("fill", annotation_color)
         .text("102 events in 1912");
         // 102 events comes from https://en.wikipedia.org/wiki/1912_Summer_Olympics

      svg.append("text")
         .attr("id", "y1920")
         .attr("x", margin.left + 168)
         .attr("y", margin.top  + 120)
         .style("text-anchor", "middle")
         .attr("fill", annotation_color)
         .text("156 events in 1920");
         // 156 events come from https://en.wikipedia.org/wiki/1920_Summer_Olympics

      svg.append("text")
         .attr("id", "y1924")
         .attr("x", margin.left + 250)
         .attr("y", margin.top  + 188)
         .style("text-anchor", "middle")
         .attr("fill", annotation_color)
         .text("126 events in 1924");
         // 126 events comes from https://en.wikipedia.org/wiki/1924_Summer_Olympics

      svg.append("text")
         .attr("id", "count_incr")
         .attr("x", margin.left + 450)
         .attr("y", margin.top  + 65)
         .style("text-anchor", "middle")
         .attr("fill", annotation_color)
         .text("Counts increasing in the late 1900's");

      // Add the scene annotation
      var annotate = document.getElementById("annotate");
      annotate.innerHTML = 'This slide shows only the Summer Olympic medal counts awarded to individuals per Olympic year. Wikipedia lists a large difference in the number of events held in <a href="https://en.wikipedia.org/wiki/1912_Summer_Olympics">1912</a>, <a href="https://en.wikipedia.org/wiki/1920_Summer_Olympics">1920</a>, and <a href="https://en.wikipedia.org/wiki/1924_Summer_Olympics">1924</a> which shows up in the medal counts. You may also observe the medal counts increasing in the late 1900s indicating an increase in the number of events.<br><br>The user may explore this using the Side-by-Side selection and may hover over the bars to see where the games where held and the medal counts.';
   }

   //--------------------------------------------------------------------------
   function annotate_scene_3(svg) {
      clear_annotations();

      document.getElementById("scenenum").innerHTML = "3 of 3";

      svg.append("text")
         .attr("id", "winter_begin")
         .attr("x", margin.left + 200)
         .attr("y", margin.top  + 320)
         .style("text-anchor", "middle")
         .attr("fill", annotation_color)
         .text("Winter games began in 1924");

      svg.append("text")
         .attr("id", "winter_less")
         .attr("x", margin.left + 500)
         .attr("y", margin.top  + 250)
         .style("text-anchor", "middle")
         .attr("fill", annotation_color)
         .text("Winter Olympics are much smaller than summer");

      // Add the scene annotation
      var annotate = document.getElementById("annotate");
      annotate.innerHTML =  'This slide shows only the Winter Olympic medal counts awarded to individuals per Olympic year. The winter games began in 1924 and are much smaller than the summer games. 1992 was the last year the winter games were held in the same year as the summer games. Then the winter games were held again in 1994 such that they are staggered every 2 years with the summer games.<br><br>The user may explore this using the Side-by-Side selection and may hover over the bars to see where the games where held and the medal counts.';
   }


   //--------------------------------------------------------------------------
   function set_scene_1() {
      scene_number = 1;
      medals_sideby  = medals_combined;
      medals_stacked = medals_combined_stacked;
      chart_title = "Olympic Medal Counts (Summer and Winter Combined)";
      y_axis_label = "Medal Counts (Summer and Winter Combined)";
   }

   //--------------------------------------------------------------------------
   function set_scene_2() {
      scene_number = 2;
      medals_sideby  = medals_summer;
      medals_stacked = medals_summer_stacked;
      chart_title = "Olympic Medal Counts (Summer Only)";
      y_axis_label = "Medal Counts (Summer Only)";
   }

   //--------------------------------------------------------------------------
   function set_scene_3() {
      scene_number = 3;
      medals_sideby  = medals_winter;
      medals_stacked = medals_winter_stacked;
      chart_title = "Olympic Medal Counts (Winter Only)";
      y_axis_label = "Medal Counts (Winter Only)";
   }


   //--------------------------------------------------------------------------
   function handle_previous() {
      switch (scene_number) {
         case 1: set_scene_3();
	           break;
         case 2: set_scene_1();
              break;
         case 3: set_scene_2();
              break;
      }
      // Re-draw the bar chart
      svg.selectAll("*").remove(); // https://stackoverflow.com/questions/10784018/how-can-i-remove-or-replace-svg-content
      rtn = draw_svg();
      svg  = rtn[0];
      rect = rtn[1];
      x    = rtn[2];
      y    = rtn[3];
   }

   //--------------------------------------------------------------------------
   function handle_next() {
      switch (scene_number) {
         case 1: set_scene_2();
	           break;
         case 2: set_scene_3();
              break;
         case 3: set_scene_1();
              break;
      }
      // Re-draw the bar chart
      svg.selectAll("*").remove(); // https://stackoverflow.com/questions/10784018/how-can-i-remove-or-replace-svg-content
      rtn = draw_svg();
      svg  = rtn[0];
      rect = rtn[1];
      x    = rtn[2];
      y    = rtn[3];
   }
   //--------------------------------------------------------------------------


	
   d3.selectAll("input")
       .on("change", changed);


//   var timeout = d3.timeout(function() {
//     d3.select("input[value=\"stacked\"]")
//         .property("checked", true)
//         .dispatch("change");
//   }, 2000);


   function changed() {
//      timeout.stop();
      if (this.value === "grouped") transitionGrouped();
      else transitionStacked();
   }

   function transitionGrouped() {
      y.domain([0, medals_stacked_max]);

      rect.transition()
         .duration(500)
         .delay(function(d, i) { return i * 10; })
         .attr("x", function(d, i) { return x(i) + x.bandwidth() / num_medals * this.parentNode.__data__.key; })
         .attr("width", x.bandwidth() / num_medals)
         .transition()
         .attr("y", function(d) { return y(d[1] - d[0]); })
         .attr("height", function(d) { return y(0) - y(d[1] - d[0]); });
      }

   function transitionStacked() {
      y.domain([0, medals_stacked_max]);

      rect.transition()
          .duration(500)
          .delay(function(d, i) { return i * 10; })
          .attr("y", function(d) { return y(d[1]); })
          .attr("height", function(d) { return y(d[0]) - y(d[1]); })
          .transition()
             .attr("x", function(d, i) { return x(i); })
             .attr("width", x.bandwidth());
   }


}); //end d3.csv()

