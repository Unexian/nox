function lexLess(seq1, seq2) {
    let s1 = seq1.split(' ').map(Number)
    let s2 = seq2.split(' ').map(Number)
    for (let i = 0; i < s1.length; i ++) {
        if (i >= s2.length) return false
        if (s1[i] != s2[i]) return s1[i] < s2[i]
    }
    return s1.length != s2.length
}

let notList = {}
let notation = notList.lprss = {
    expandLimit: ind => '0 ' + (1+ind),
    expand: function(seq, index) {
        let ss = seq.split(' ').map(Number)
        let cut = ss.at(-1)
        let par = ss.findLastIndex(x => x<cut)
        let diff = cut - ss[par] - 1
        let good = ss.slice(0, par)
        for (let i = 0; i <= index; i ++)
            good = good.concat(ss.slice(par, -1).map(x => x + diff * i))
        return good.join(' ')
    },
    canExpand: seq => seq != '0' && seq.slice(-2) != ' 0',
    less: lexLess,
}
notList.tilde = {
    search: function(str, from) {
        let depth = 1, i = from - 1
        for (; i >= 0 && depth != 0; i --) depth += (str[i] == '>') - (str[i] == '<')
        return (depth == 0) ? i+1 : undefined
    },
    isCountable: function(str) {
        let a = str.length - 1
        while (a >= 0) {
            if (str[a] == '~') return true
            if (str[a] == '>') a = this.search(str, a)
            a --
        }
        return false
    },
    expandLimit: index => '~<' + '<'.repeat(index) + '>'.repeat(index+1),
    expand: function(seq, index) {
        let z = seq.length
        do { left = this.search(seq, --z) }
        while (z >= 0 && left != z - 1 && !this.isCountable(seq.slice(left + 1, z)))
        if (left == z - 1) {
            let a = z - 1
            while (a >= 0 && seq[a] != '~') {
                if (seq[a] == '>') a = this.search(seq, a)
                a --
            }
            let nest = seq.slice(a, left) + seq.slice(z + 1)
            for (let i = 1; i < index; i ++)
                nest = seq.slice(a, left) + nest + seq.slice(z + 1)
            return seq.slice(0, a) + nest
        }
        if (seq.slice(z-3, z) == '~<>') {
            rep = seq.slice(left, z - 3) + '>'
            return seq.slice(0, left) + rep.repeat(index+1) + seq.slice(z+1)
        }
        return seq.slice(0, left+1) +
            this.expand(seq.slice(left+1,z), index) + seq.slice(z)
    },
    canExpand: seq => seq.length > 0 && seq.slice(-3) != '~<>',
    less: function(seq1, seq2) {
        let s1 = seq1.replaceAll('~', '='), s2 = seq2.replaceAll('~', '=')
        for (let i = 0; i < s1.length; i ++) {
            if (i >= s2.length) return false
            if (s1[i] != s2[i]) return s1[i] > s2[i]
        }
        return s1.length != s2.length
    }
}
notList.bms = {
    getParent(mat, c, r) {
        if (!r) return mat.map(c => c[0]).slice(0,c).findLastIndex(x => x < mat[c][0])
        let cp = c
        while (true) {
            cp = this.getParent(mat, cp, r-1)
            if ((mat[cp][r]??0) < mat[c][r]) return cp
        }
    },
    expandLimit: ind => '(0)(1'+',1'.repeat(ind)+')',
    expand: function(mat, ind) {
        mat = mat.slice(1,-1).split(')(').map(c => c.split(',').map(Number))
        let lnz = mat.at(-1).concat(0).indexOf(0) - 1
        let br = this.getParent(mat, mat.length-1, lnz)
        let good = mat.slice(0, br)
        let bad = mat.slice(br, -1).map(r =>
            r.concat(new Array(mat.at(-1).length).fill(0)))
        let delta = mat.at(-1).map((e,r) => e-(bad[0][r]??0))
        delta[lnz] --
        let mask = []
        for (let c = 0; c < bad.length; c ++) {
            let mcol = []
            for (let r = 0; r < bad[c].length; r ++) {
                if (r >= lnz+1) {
                    mcol.push(false)
                    continue
                }
                let cp = c
                while (cp > 0) cp = this.getParent(bad, cp, r)
                mcol.push(cp == 0)
            }
            mask.push(mcol)
        }
        for (let i = 0; i < ind; i ++) good = good.concat(bad.map((c,ci) =>
            c.map((e,ri) => e+(delta[ri]??0)*mask[ci][ri]*i)))
        if (good.length == 0) return '(0)'
        return '(' + good.map(c=>c.join(',')).join(')(').replaceAll(',0','') + ')'
    },
    canExpand: mat => mat.length > 0 && mat.slice(-3) != '(0)',
    less: function(mat1, mat2) {
        mat1 = mat1.slice(1,-1).split(')(').map(c => c.split(',').map(Number))
        mat2 = mat2.slice(1,-1).split(')(').map(c => c.split(',').map(Number))
        for (let c = 0; c < mat1.length; c ++) {
            if (c >= mat2.length) return false
            for (let r = 0; r < mat1[c].length; r ++) {
                if (r >= mat2[c].length && mat1[c][r] > 0) return false
                if (mat1[c][r] != (mat2[c][r]??0)) return mat1[c][r] < (mat2[c][r]??0)
            }
            if (mat2[c][mat1[c].length] > 0) return true
        }
        return mat1.length != mat2.length
    }
}
notList.spms = {
    unwrap: seq => seq.replaceAll(',0','').slice(1,-1)
        .split(')(').map(c => c.split(',').map(Number)),
    wrap: mat => '(' + mat.map(c => c.join(',')).join(')(').replaceAll(',0','') + ')',
    expandLimit: ind => '(0)(1' + ',1'.repeat(ind) + ')',
    expand: function(seq, ind) {
        seq = this.unwrap(seq)
        let li = seq.at(-1).findLastIndex(k => k > 0)
        let l = seq.at(-1)[li]
        seq.at(-1).splice(li, Infinity, ...seq.at(-1-l)
            .slice(li).map(z => z + (z!=0)*l))
        let ri = seq.slice(0,-l).findLastIndex(c => c[li] != 1)
        let bad = seq.slice(ri+1)
        for (let i = 1; i <= ind; i ++)
            seq = seq.concat(bad.map(c => c.map((e,k) => e + l*i*(e<k))))
        return this.wrap(seq.slice(0,-1))
    },
    canExpand: function (seq) {
        return seq.length > 0 && this.unwrap(seq).at(-1)[0] != 0 },
    less: function(seq1, seq2) {
        let s1 = this.unwrap(seq1)
        let s2 = this.unwrap(seq2)
        for (let i = 0; i < s1.length; i ++) {
            if (i >= s2.length) return false
            for (let j = 0; j < s1[i].length; j ++) {
                if (j >= s2[i].length) return false
                if (s1[i][j] != (s2[i][j]??0)) {
                    if (s1[i][j] == 0) return true
                    if ((s2[i][j]??0) == 0) return false
                    return s1[i][j] > (s2[i][j]??0)
                }
            }
            if (s1[i].length != s2[i].length) return true
        }
        return s1.length != s2.length
    }
}
notList.sudden = {
    getBR: function(seq) {
        let z = seq.findLastIndex(k => k < seq.at(-1))
        let first = seq.slice(z).map(x => x-seq[z])
        let out
        while (true) {
            let pre = seq.slice(z).map(x => x-seq[z])
            if (this.lessNano(pre, first)) break
            z = seq.slice(0, z).findLastIndex(k => k <= seq[z])
            out = pre
        }
        return seq.length - out.length
    },
    lessNano: function(s1, s2) {
        for (let i = 0; i < s1.length; i ++) {
            if (i >= s2.length) return false
            if (s1[i] != s2[i]) return s1[i] < s2[i]
        }
        return s1.length != s2.length
    },
    expandLimit: ind => '0 0 ' + (1+ind),
    expand: function(seq, ind) {
        seq = seq.split(' ').map(Number)
        let br = this.getBR(seq)
        let good = seq.slice(0, br)
        let bad = seq.slice(br, -1)
        let delta = seq.at(-1) - seq[br] - 1
        for (let i = 0; i < ind; i ++) {
            good = good.concat(bad.map(z => z+i*delta))
        }
        if (good.length < 2) return '0'
        if (good.at(-1) > 0) return good.join(' ')
        return good.slice(0,-1).join(' ')
    },
    canExpand: seq => seq.length > 0 && seq.split(' ').at(-1) != '0',
    less: function(seq1, seq2) {
        let s1 = seq1.split(' ').map(Number)
        let s2 = seq2.split(' ').map(Number)
        return this.lessNano(s1, s2)
    }
}
notList.dbms = {
    ...notList.bms,
    expandLimit: function(ind) {
        let out = [[0]]
        for (let i = 1; i <= ind+1; i ++) {
            let push = []
            for (let j = i; j > 0; j --) push.push(j)
            out.push(push)
        }
        return '(' + out.map(c => c.join(',')).join(')(') + ')'
    }
}