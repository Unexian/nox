function retract(par) {
    let parIdt = par.querySelector(".indent")
    if (parIdt.childElementCount == 0) return
    parIdt.removeChild(parIdt.firstElementChild)
    par.querySelector(".name").setAttribute("class", "name")
    if (parIdt.childElementCount == 0) par.querySelector("#ret").setAttribute("class", "empty")
}
function expand(par) {
    let newString
    if (par == document.querySelector("#core")) {
        let last = par.querySelector(".indent").firstElementChild?.querySelector(".name").innerText
        for (let i = 0; i < 100; i ++) {
            let exp = notation.expandLimit(i)
            if (last === undefined || notation.less(last, exp)) {
                newString = exp
                break
            } else if (i == 99) {
                console.error("Could not find valid expansion :[")
                par.querySelector(".name").setAttribute("class", "name halt")
                return
        }   }
    } else {
        let prev = par.querySelector(".name").innerText
        if (!notation.canExpand(prev)) return
        let last
        if (par.querySelector(".indent").childElementCount == 0) {
            let lastSet = par
            while (lastSet !== document.querySelector("#core") &&
                lastSet.nextElementSibling === null) {
                lastSet = lastSet.parentElement.parentElement
            }
            last = lastSet.nextElementSibling?.querySelector(".name")?.innerText
        } else last = par.querySelector(".indent").querySelector(".name").innerText
        for (let i = 0; i < 100; i ++) {
            let exp = notation.expand(prev, i)
            if (last === undefined || notation.less(last, exp)) {
                newString = exp
                break
            } else if (i == 99) {
                console.error("Could not find valid expansion :[")
                par.querySelector(".name").setAttribute("class", "name halt")
                return
    }   }   }
    let temp = document.querySelector("#template").cloneNode(true)
    temp.querySelector(".name").innerText = newString
    temp.removeAttribute("id")
    temp.querySelector(".name").addEventListener("click", function() {expand(temp)})
    temp.querySelector("#ret").addEventListener("click", function() {retract(temp)})
    par.querySelector(".indent").insertBefore(temp, par.querySelector(".indent").firstElementChild)
    par.querySelector("#ret").setAttribute("class", "clicked")
    if (!notation.canExpand(newString)) temp.querySelector("#ret").setAttribute("class", notation.canExpand(newString) ? "empty" : "locked")
    return temp
}

function search(search) {
    document.querySelector("#core>.indent").innerHTML = ""
    document.querySelector("#core>#ret").setAttribute("class", "empty")
    let next = document.querySelector("#core")
    do {
        let curr = undefined
        do { curr = expand(next) } while (notation.less(curr.querySelector(".name").innerText, search))
        next = curr
    } while (notation.canExpand(next.querySelector(".name").innerText) && next.querySelector(".name").innerText != search)
}
document.querySelector("#core .name").addEventListener("click", function() { expand(document.querySelector("#core")) })
document.querySelector("#core #ret").addEventListener("click", function() { retract(document.querySelector("#core")) })
document.querySelector("#search").addEventListener("submit", function(e) {
    e.preventDefault()
    search(document.querySelector("#search>#qry").value)
})
document.querySelector("#search>#clr").addEventListener("click", function() { document.querySelector("#search>#qry").value = "" })

function setNot(n) {
    for (let child of document.querySelector("#sel").children) child.setAttribute("class", "empty")
    document.querySelector("#sel #" + n).setAttribute("class", "clicked")
    document.querySelector("#core>.indent").innerHTML = ""
    document.querySelector("#core>#ret").setAttribute("class", "empty")
    notation = notList[n]
    document.querySelector("#core").removeAttribute("class")
    document.querySelector("#program").setAttribute("class", "hidden")
}
for (let not in notList) document.querySelector("#sel #" + not).addEventListener("click", function() { setNot(not) })

document.querySelector("#sel #custom").addEventListener("click", function() {
    for (let child of document.querySelector("#sel").children) child.setAttribute("class", "empty")
    this.setAttribute("class", "clicked")
    document.querySelector("#core>.indent").innerHTML = ""
    document.querySelector("#core>#ret").setAttribute("class", "empty")
    notation = Function(document.querySelector("#program textarea").value)()
    document.querySelector("#core").removeAttribute("class")
    document.querySelector("#program").setAttribute("class", "hidden")
})
document.querySelector("#sel #edit").addEventListener("click", function() {
    for (let child of document.querySelector("#sel").children) child.setAttribute("class", "empty")
    this.setAttribute("class", "clicked")
    document.querySelector("#core").setAttribute("class", "hidden")
    document.querySelector("#program").removeAttribute("class")
})

document.querySelector("#program textarea").value = [
    "// Template notation: LPrSS",
    "// Edit to make your own!",
    "",
    "return {",
    "  expandLimit: ind => '0 ' + (1+ind),",
    "  expand: function(seq, index) {",
    "    let ss = seq.split(' ').map(Number)",
    "    let cut = ss.at(-1)",
    "    let par = ss.findLastIndex(x => x<cut)",
    "    let diff = cut - ss[par] - 1",
    "    let good = ss.slice(0, par)",
    "    for (let i = 0; i <= index; i ++)",
    "      good = good.concat(ss.slice(par, -1).map(x => x + diff * i))",
    "    return good.join(' ')",
    "  },",
    "  canExpand: seq => seq != '0' && seq.slice(-2) != ' 0',",
    "  less: lexLess",
    "}"
].join('\n')
document.querySelector("#program button").addEventListener("click", function() {
    let encoded = encodeURI(document.querySelector("#program textarea").value)
    window.history.replaceState(null, "", "?cust=" + encodeURI(encoded))
    this.setAttribute("class", "clicked")
    setTimeout(() => {
        document.querySelector("#program button").setAttribute("class", "empty")
    }, 1000);
})

let up = new URL(document.location).searchParams
if (up.has("not") && up.get("not") in notList) setNot(up.get("not"))
if (up.has("cust") && up.get("cust")) {
    document.querySelector("#program textarea").value = decodeURI(up.get("cust"))
    for (let child of document.querySelector("#sel").children) child.setAttribute("class", "empty")
    document.querySelector("#sel #edit").setAttribute("class", "clicked")
    document.querySelector("#core").setAttribute("class", "hidden")
    document.querySelector("#program").removeAttribute("class")
}
if (up.has("not") && up.get("ord")) search(up.get("ord"))
