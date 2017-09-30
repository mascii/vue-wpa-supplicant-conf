import Vue from 'vue';
import pbkdf2 from 'pbkdf2';

const configHeader = `country=JP
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
`;

new Vue({
  el: '#js-itemList',
  data: {
    newSSID: '',
    newPassphrase: '',
    items: [],
    url: '#',
  },
  created() {
    this.makeConfigFile();
  },
  methods: {
    addItem(event) {
      event.preventDefault();
      if (this.newSSID.length === 0) return;
      this.items.push({
        id: this.newSSID,
        passphrase: this.newPassphrase,
        psk: this.newPassphrase.length !== 0 ? pbkdf2.pbkdf2Sync(this.newPassphrase, this.newSSID, 4096, 32, 'sha1').toString('hex') : '',
      });
      this.newSSID = '';
      this.newPassphrase = '';
      this.makeConfigFile();
    },
    deleteItem(item) {
      const index = this.items.indexOf(item);
      this.items.splice(index, 1);
      this.makeConfigFile();
    },
    makeConfigFile() {
      const fileName = 'wpa_supplicant.conf';
      const config = configHeader + this.items.map((item) => {
        let network = 'network={\n';
        network += `    ssid="${item.id}"\n`;
        if (item.psk !== '') {
          network += `    psk=${item.psk}\n`;
        } else {
          network += '    key_mgmt=NONE\n';
        }
        network += '}';
        return network;
      }).join('\n');
      const blob = new Blob([config], { type: 'text/plain' });

      if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, fileName);
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      } else {
        this.url = window.URL.createObjectURL(blob);
      }
    },
  },
});
