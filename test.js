function d() {
    let a = 'xedahic307&#064;sc2hub.com'
    a = a.replace('&#064;', '@')
    console.log(a)
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi;
    const match = re.exec(a);
    if (match && match.length) {
      console.log(String(match[0]).toLowerCase());
      return String(match[0]).toLowerCase();
    }
}

d()