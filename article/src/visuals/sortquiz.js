function Sortquiz() {

    let svg,
        width,
        height,
        button,
        dStart,
        elStart,
        elem;

    const margin = {
        top: 35,
        right: 20,
        bottom: 30,
        left: 20
    };


    let data = []

    let guessData;

    const r = 1000,
        r_big = 1500;

    const starColor = "#FFCC00";

    const starColorWrong = "#ff4b7d";

    const triangleColor = "#ff912d";

    const lineColor = "#1e69aa"

    const textOffset = 30;

    const lineOffset = 0.05;

    const newOffset = 0.11;

    let star = d3.symbol().type(d3.symbolStar)

    let circ = d3.symbol().type(d3.symbolCircle)

    let triangle = d3.symbol().type(d3.symbolTriangle)

    let inUpdate = false;


    function pulse() {
        svg.select(".star.new")
            .transition()
            .duration(500)
            .attr("d", triangle.size(r_big))
            .transition()
            .duration(500)
            .attr("d", triangle.size(r))
            .on("end", () => {
                inUpdate = true;
                pulse()
            })
    }


    function create(elementId) {

        elem = elementId

        let root = d3.select("#" + elementId);

        if (root.empty()) {
            return;
        }

        width = 720
        height = width * 1.5

        width = width - margin.left - margin.right;
        height = height - margin.top - margin.bottom;

        root.selectAll("*").remove();


        svg = root.append("svg")
            // .attr("width", width + margin.left + margin.right)
            // .attr("height", height + margin.top + margin.bottom)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("class", "viz-svg")
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

        svg.append("rect")
            .attr("width", width * 0.7)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0)
            .attr("opacity", 0)

        svg.append("line")
            .attr("x1", width * lineOffset)
            .attr("x2", width * lineOffset)
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", lineColor)
            .attr("stroke-width", 4)


        button = root.append("div")
            .attr("id", "next")
            .on("click", () => {
                correct()

            })

        button.append("p")
            .text("Gissa!")

        init()
    }

    function init() {


        guessData = datasets["timeline"].filter(d => !d.fixed)
        guessData.map(d => {
            d.correct = false
        })
        guessData = guessData.sort((a, b) => b.order - a.order)

        initData = datasets["timeline"].filter(d => d.fixed)
        initData.map(d => {
            d.correct = true
        })
        data = initData



        let events = svg.selectAll(".event")
            .data(data, d => d.name)

        let eventsEnter = events.enter()

        eventsEnter
            .append("path")
            .attr("class", "event star")
            .attr("d", star.size(r))
            .attr("transform", function (d, i) {
                d.y = height / (data.length - 1) * i
                d.x = width * lineOffset
                return `translate(${d.x}, ${d.y})`
            })
            .attr("fill", starColor)

        eventsEnter
            .append("text")
            .attr("class", "event text base-text")
            .attr("x", d => d.x)
            .attr("dx", textOffset)
            .attr("y", (d, i) => d.y)
            .attr("alignment-baseline", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-style", "italic")
            .text(d => `${d.name} (${d.yr})`)

        next()

    }

    function next() {


        if (guessData.length > 0) {
            update(guessData.pop())
        } else {

            inUpdate = false;
            winScreen()
            broadcastWon();
        }


    }


    function update(datum) {

        inUpdate = true;

        svg.selectAll(".event.star").sort((a, b) => a.yr - b.yr)

        svg.selectAll(".event.star")
            .classed("new", false)
            .transition()
            .duration(500)
            .attr("transform", function (d, i) {
                d.y = height / (data.length - 1) * i
                d.x = width * lineOffset
                return `translate(${d.x}, ${d.y})`
            })

        svg.selectAll(".event.text")
            .classed("new", false)
            .transition()
            .duration(500)
            .attr("x", d => d.x)
            .attr("dx", textOffset)
            .attr("y", (d, i) => d.y)
            .attr("font-weight", "normal")
            .attr("font-style", "italic")
            .text(d => `${d.name} (${d.yr})`)



        data.push(datum)


        let events = svg.selectAll(".event")
            .data(data, d => d.name)

        let eventsEnter = events.enter()

        eventsEnter
            .append("path")
            .attr("class", "event star new")
            .attr("d", triangle.size(r))
            .attr("transform", function (d, i) {

                let num = (data.length - 1) % 2 == 0 ? height / 2 : (height / 2) - ((height / (data.length - 2) / 2))
                d.y = num
                d.x = width * newOffset
                return `translate(${d.x}, ${d.y}) rotate(30)`
            })
            .attr("fill", triangleColor)


        pulse()

        eventsEnter
            .append("text")
            .attr("class", "base-text event text new")
            .attr("x", d => d.x)
            .attr("dx", textOffset)
            .attr("y", (d, i) => d.y)
            .attr("alignment-baseline", "middle")
            .attr("dominant-baseline", "middle")
            // .attr("font-style", "italic")
            .attr("font-weight", "bold")
            .text(d => d.name)
            .attr("opacity", 0)
            .transition()
            .attr("opacity", 1)

        svg.selectAll(".new")
            .call(d3.drag()
                .filter(function () {
                    return d3.select(this).classed("new")
                })
                .on("start", dragstart)
                .on("drag", dragged)
                .on("end", dragend)
            );



    };

    function broadcastWon() {
        // VAR.hasWon = "5000px";

    }


    function correct() {

        if (inUpdate) {

            inUpdate = false;

            data.sort((a, b) => a.yr - b.yr)
            let dataPos = data.slice().sort((a, b) => a.y - b.y)
            let orderCorrect = _.isEqual(data, dataPos)

            svg.select(".star.new")
                .transition()
                .duration(200)
                .attr("transform", d => {
                    d.correct = orderCorrect
                    d.x = width * lineOffset
                    return `translate(${d.x}, ${d.y})`
                })
                .attr("d", star.size(r))
                .attr("fill", orderCorrect ? starColor : starColorWrong)
                .transition()
                .duration(350)
                .ease(d3.easeLinear)
                .attr("d", orderCorrect ? star.size(r_big + 1000) : star.size(r / 10))
                .attr("transform", d => {
                    let rotation = d.correct ? -180 : 0
                    return `translate(${d.x}, ${d.y}) rotate(${rotation})`
                })
                .transition()
                .duration(350)
                .ease(d3.easeLinear)
                .attr("d", star.size(r))
                .attr("transform", d => {
                    let rotation = d.correct ? -359.9 : 0
                    return `translate(${d.x}, ${d.y}) rotate(${rotation})`
                })
                .on("end", function (d) {
                    setTimeout(() => {
                        inUpdate = true;
                        _toRightPos()
                        // next()
                    }, 300)

                })
        }


    }

    function _toRightPos() {



        svg.selectAll(".event.star").sort((a, b) => a.yr - b.yr)

        svg.selectAll(".event.star")
            .classed("new", false)
            .transition()
            .duration(750)
            .attr("transform", function (d, i) {
                d.y = height / (data.length - 1) * i
                d.x = width * lineOffset
                return `translate(${d.x}, ${d.y})`
            })
            .on("end", (d, i) => {
                if (i == data.length - 1) {
                    inUpdate = true;
                    setTimeout(() => {
                        // inUpdate = true;
                        next();
                    }, 600)
                }

            })

        svg.selectAll(".event.text")
            .transition()
            .duration(750)
            .attr("x", d => d.x)
            // .attr("dx", textOffset)
            .attr("y", (d, i) => d.y)
            .attr("font-weight", "normal")
            .attr("font-style", "italic")
            .text(d => `${d.name} (${d.yr})`)

    }

    function winScreen() {

        button
            .on("click", () => {})

        svg.select("line")
            .transition()
            .duration(1000)
            .attr("y1", () => height / 2)
            .attr("y2", () => height / 2)


        let endR = width * 0.35
        let angle = (2 * Math.PI) / data.length
        let midX = width / 2
        let midY = (height / 3) * 1


        svg.selectAll(".event.text")
            .attr("fill-opacity", 1)
            .transition()
            .duration(1000)
            .attr("fill-opacity", 0)
            .on("end", (d, i) => {
                if (i === 0) {

                    svg.selectAll(".event.star")
                        .sort((a, b) => (a.correct === b.correct) ? 0 : a.correct ? -1 : 1)
                        .transition()
                        .duration(2000)
                        .attr("transform", (d, i) => {
                            let an = angle * i - Math.PI / 2
                            d.x = midX + endR * Math.cos(an)
                            d.y = midY + endR * Math.sin(an)
                            return `translate(${d.x}, ${d.y})`
                        })

                    let nCorrect = data.filter(d => d.correct).length


                    let winSubtext = ["Läs mer om händelserna lite längre ner,", "eller prova quizet igen 👇"]

                    let pCorrect = nCorrect / data.length

                    if (pCorrect === 1) {

                        winSubtext.unshift("Alla rätt – grattis!")

                    } else if (pCorrect >= 0.5) {

                        winSubtext.unshift("Bra jobbat!")

                    } else {
                        winSubtext.unshift("Bättre kan du!")
                    }


                    button
                        .on("click", () => {
                            create(elem)
                        })
                    button.select("p")
                        .text("Prova igen!")

                    hasWon = true;


                    svg.append("text")
                        .attr("class", "base-text result-text score")
                        .attr("x", midX)
                        .attr("y", midY)
                        // .attr("dy", -75)
                        .attr("alignment-baseline", "middle")
                        .attr("dominant-baseline", "middle")
                        .attr("text-anchor", "middle")
                        .text(`${nCorrect} poäng`)
                        .attr("opacity", 0)
                        .transition()
                        .duration(2000)
                        .attr("opacity", 1)

                    svg.selectAll(".subtext")
                        .data(winSubtext)
                        .enter()
                        .append("text")
                        .attr("class", "base-text result-text subtext")
                        .attr("x", midX)
                        .attr("y", (height / 4) * 3)
                        .attr("dy", (d, i) => i * 48)
                        .attr("alignment-baseline", "middle")
                        .attr("dominant-baseline", "middle")
                        .attr("text-anchor", "middle")
                        .text(d => d)
                        .attr("opacity", 0)
                        .transition()
                        .duration(2000)
                        .attr("opacity", 1)

                }
            })

    }




    function dragged(d) {

        if (inUpdate) {


            let new_y = d3.event.y
            new_y = Math.min(Math.max(new_y, 10), height - 10);

            svg.select(".star.new")
                .attr("transform", function (d, i) {
                    let delta = d3.event.y - dStart
                    let newY = Math.min(Math.max((elStart + delta), 10), height - 10);
                    d.y = newY
                    d.x = width * newOffset
                    return `translate(${d.x}, ${d.y}) rotate(30)`
                })

            svg.select(".text.new")
                .attr("x", b => b.x)
                .attr("y", b => b.y)


        }

    }

    function dragstart(d) {
        if (inUpdate) {
            dStart = d3.event.y

            elStart = d3.select(".star.new").data()[0].y

            svg.select(".star.new")
                .transition()
                .duration(75)
                .attr("d", triangle.size(r_big))

        }

    }

    function dragend(d) {
        if (inUpdate) {

            svg.select(".star.new")
                .transition()
                .duration(500)
                .attr("d", triangle.size(r))
                .on("end", () => {
                    pulse()
                })
        }
    }


    return {
        "create": create,
        "init": init,
        "update": update,
        "correct": correct,
        "next": next,
        "winScreen": winScreen,
    }
}