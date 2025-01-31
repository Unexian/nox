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

document.querySelector("#core .name").addEventListener("click", function() { expand(document.querySelector("#core")) })
document.querySelector("#core #ret").addEventListener("click", function() { retract(document.querySelector("#core")) })
document.querySelector("#search").addEventListener("submit", function(e) {
    e.preventDefault()
    document.querySelector("#core>.indent").innerHTML = ""
    document.querySelector("#core>#ret").setAttribute("class", "empty")
    let search = document.querySelector("#search>#qry").value
    let next = document.querySelector("#core")
    do {
        let curr = undefined
        do { curr = expand(next) } while (notation.less(curr.querySelector(".name").innerText, search))
        next = curr
    } while (notation.canExpand(next.querySelector(".name").innerText) && next.querySelector(".name").innerText != search)
})
document.querySelector("#search>#clr").addEventListener("click", function() { document.querySelector("#search>#qry").value = "" })

document.querySelector("#sel #lprss").addEventListener("click", function() {
    for (let child of document.querySelector("#sel").children) child.setAttribute("class", "empty")
    this.setAttribute("class", "clicked")
    document.querySelector("#core>.indent").innerHTML = ""
    document.querySelector("#core>#ret").setAttribute("class", "empty")
    notation = notList.lprss
})
document.querySelector("#sel #tilde").addEventListener("click", function() {
    for (let child of document.querySelector("#sel").children) child.setAttribute("class", "empty")
    this.setAttribute("class", "clicked")
    document.querySelector("#core>.indent").innerHTML = ""
    document.querySelector("#core>#ret").setAttribute("class", "empty")
    notation = notList.tilde
})
document.querySelector("#sel #pair").addEventListener("click", function() {
    for (let child of document.querySelector("#sel").children) child.setAttribute("class", "empty")
    this.setAttribute("class", "clicked")
    document.querySelector("#core>.indent").innerHTML = ""
    document.querySelector("#core>#ret").setAttribute("class", "empty")
    notation = notList.pair
})
document.querySelector("#sel #spms").addEventListener("click", function() {
    for (let child of document.querySelector("#sel").children) child.setAttribute("class", "empty")
    this.setAttribute("class", "clicked")
    document.querySelector("#core>.indent").innerHTML = ""
    document.querySelector("#core>#ret").setAttribute("class", "empty")
    notation = notList.spms
})