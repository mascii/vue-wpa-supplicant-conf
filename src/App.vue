<template>
  <div>
    SSID: <input type="text" ref="ssid" v-model="newSSID" v-on:keydown.enter="addItem">
    Passphrase: <input type="text" v-model="newPassphrase" v-on:keydown.enter="addItem">
    <button v-on:click="addItem">追加</button>
    <ul>
      <li v-for="item in items">
        SSID: {{item.id}},
        Passphrase: {{item.passphrase}}
        <button v-on:click="deleteItem(item)">削除</button>
      </li>
    </ul>
    <a href="#" v-bind:href="urlWPA" v-on:click="downloadWPA" download="wpa_supplicant.conf"><button>wpa_supplicant.conf作成</button></a>
    <a href="#" v-bind:href="urlSSH" v-on:click="downloadSSH" download="ssh.txt"><button>ssh.txt作成</button></a>
  </div>
</template>

<script>
import { pbkdf2Sync } from 'pbkdf2';

const configHeader = `country=JP
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
`;

export default {
  data() {
    return {
      newSSID: '',
      newPassphrase: '',
      items: [],
      urlWPA: '#',
      urlSSH: '#',
      config: '',
    };
  },
  mounted() {
    this.makeConfigFile();
    if (!window.navigator.msSaveBlob) {
      this.urlSSH = window.URL.createObjectURL(this.makeBlob(''));
    }
    this.$refs.ssid.focus();
  },
  methods: {
    addItem(event) {
      event.preventDefault();
      if (this.newSSID.length === 0) return;
      this.items.push({
        id: this.newSSID,
        passphrase: this.newPassphrase,
        psk: this.newPassphrase.length !== 0 ? pbkdf2Sync(this.newPassphrase, this.newSSID, 4096, 32, 'sha1').toString('hex') : '',
      });
      this.newSSID = '';
      this.newPassphrase = '';
      this.makeConfigFile();
      this.$refs.ssid.focus();
    },
    deleteItem(item) {
      const index = this.items.indexOf(item);
      this.items.splice(index, 1);
      this.makeConfigFile();
    },
    makeConfigFile() {
      this.config = configHeader + this.items.map((item) => {
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

      if (!window.navigator.msSaveBlob) {
        this.urlWPA = window.URL.createObjectURL(this.makeBlob(this.config));
      }
    },
    downloadWPA() {
      if (window.navigator.msSaveBlob) {
        const fileName = 'wpa_supplicant.conf';
        window.navigator.msSaveBlob(this.makeBlob(this.config), fileName);
      }
    },
    downloadSSH() {
      if (window.navigator.msSaveBlob) {
        const fileName = 'ssh.txt';
        window.navigator.msSaveBlob(this.makeBlob(''), fileName);
      }
    },
    makeBlob(content) {
      return new Blob([content], { type: 'text/plain' });
    },
  },
};
</script>
