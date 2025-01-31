let notList = {
    lprss: {
        expandLimit: ind => '0 ' + (1+ind),
        expand: function(seq, index) {
            let ss = seq.split(' ').map(Number)
            let cut = ss.at(-1)
            let par = ss.findLastIndex(x => x<cut)
            let diff = cut - ss[par] - 1
            let good = ss.slice(0, par)
            for (let i = 0; i <= index; i ++) good = good.concat(ss.slice(par, -1).map(x => x + diff * i))
            return good.join(' ')
        },
        canExpand: seq => seq != '0' && seq.slice(-2) != ' 0',
        less: function(seq1, seq2) {
            let s1 = seq1.split(' ').map(Number)
            let s2 = seq2.split(' ').map(Number)
            for (let i = 0; i < s1.length; i ++) {
                if (i >= s2.length) return false
                if (s1[i] != s2[i]) return s1[i] < s2[i]
            }
            return s1.length != s2.length
        },
    },
    tilde: {
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
            do { left = this.search(seq, --z) } while (z >= 0 && left != z - 1 && !this.isCountable(seq.slice(left + 1, z)))
            if (left == z - 1) {
                let a = z - 1
                while (a >= 0 && seq[a] != '~') {
                    if (seq[a] == '>') a = this.search(seq, a)
                    a --
                }
                let nest = seq.slice(a, left) + seq.slice(z + 1)
                for (let i = 1; i < index; i ++) nest = seq.slice(a, left) + nest + seq.slice(z + 1)
                return seq.slice(0, a) + nest
            }
            if (seq.slice(z-3, z) == '~<>') {
                rep = seq.slice(left, z - 3) + '>'
                return seq.slice(0, left) + rep.repeat(index+1) + seq.slice(z+1)
            }
            return seq.slice(0, left+1) + this.expand(seq.slice(left+1,z), index) + seq.slice(z)
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
    },
    pair: {
        expandLimit: function(ind) {
            let out = '0,0'
            for (let i = 1; i <= ind; i ++) out += ' ' + i + ',' + i
            return out
        },
        expand: function(seq, ind) {
            seq = seq.split(' ').map(c => c.split(',').map(Number))
            let parInd = seq.findLastIndex(x => x[0] < seq.at(-1)[0] && (seq.at(-1)[1] == 0 || x[1] < seq.at(-1)[1] ))
            let diff = seq.at(-1)[1] == 0 ? 0 : seq.at(-1)[0] - seq[parInd][0]
            let good = seq.slice(0, parInd)
            for (let i = 0; i < ind; i ++) good = good.concat(seq.slice(parInd, -1).map(x => [x[0]+diff*i,x[1]]))
            return good.map(c => c.join(',')).join(' ')
        },
        canExpand: seq => seq.length > 0 && seq.split(' ').at(-1) != '0,0',
        less: function(seq1, seq2) {
            let s1 = seq1.split(' ').map(c => c.split(',').map(Number))
            let s2 = seq2.split(' ').map(c => c.split(',').map(Number))
            for (let i = 0; i < s1.length; i ++) {
                if (i >= s2.length) return false
                if (s1[i][0] != s2[i][0]) return s1[i][0] < s2[i][0]
                if (s1[i][1] != s2[i][1]) return s1[i][1] < s2[i][1]
            }
            return s1.length != s2.length
        }
    },
    spms: {
        unwrap: seq => seq.replaceAll(',0','').slice(1,-1).split(')(').map(c => c.split(',').map(Number)),
        wrap: mat => '(' + mat.map(c => c.join(',')).join(')(').replaceAll(',0','') + ')',
        expandLimit: ind => '(0)(1' + ',1'.repeat(ind) + ')',
        expand: function(seq, ind) {
            seq = this.unwrap(seq)
            let li = seq.at(-1).findLastIndex(k => k > 0)
            let l = seq.at(-1)[li]
            seq.at(-1).splice(li, Infinity, ...seq.at(-1-l).slice(li).map(z => z + (z!=0)*l))
            let ri = seq.slice(0,-l).findLastIndex(c => c[li] != 1)
            let bad = seq.slice(ri+1)
            for (let i = 1; i <= ind; i ++) seq = seq.concat(bad.map(c => c.map((e,k) => e + l*i*(e<k))))
            return this.wrap(seq.slice(0,-1))
        },
        canExpand: function (seq) { return seq.length > 0 && this.unwrap(seq).at(-1)[0] != 0 },
        less: function(seq1, seq2) {
            let s1 = this.unwrap(seq1)
            let s2 = this.unwrap(seq2)
            for (let i = 0; i < s1.length; i ++) {
                if (i >= s2.length) return false
                for (let j = 0; j < s1[i].length; j ++) {
                    if (j >= s2[i].length) return false
                    if (s1[i][j] != (s2[i][j] || 0)) {
                        if (s1[i][j] == 0) return true
                        if ((s2[i][j] || 0) == 0) return false
                        return s1[i][j] > (s2[i][j] || 0)
                    }
                }
                if (s1[i].length != s2[i].length) return true
            }
            return s1.length != s2.length
        }
    }
}
let notation = notList.lprss