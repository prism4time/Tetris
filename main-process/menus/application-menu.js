const {BrowserWindow,Menu,app,} = require('electron');

let template = [{
    label: 'State',
    submenu:[{
        label: 'Pause',
        accelerator: 'CmdOrCtrl+P',
        role: 'pause'
    },{
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Z',
        role: 'exit'
    }],
}, {
    label: 'Window',
    role: 'window',
    submenu: [{
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    }, {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    }]
}
];


app.on('ready', () => {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});
