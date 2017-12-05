<template>
  <div>
    <form @submit="calculate" autocomplete="off">
      SSID: <input type="text" name="newSSID" ref="ssid">
      Passphrase: <input type="password" name="newPassphrase">
      <button type="submit">Calculate</button>
    </form>
    PSK: <input type="text" v-model="psk" ref="psk" readonly="readonly">
  </div>
</template>

<script>
import PBKDF2 from 'crypto-js/pbkdf2';

export default {
  data() {
    return {
      psk: '',
    };
  },
  mounted() {
    this.$refs.ssid.focus();
  },
  methods: {
    calculate(e) {
      e.preventDefault();

      const newSSID = e.target.newSSID.value;
      const newPassphrase = e.target.newPassphrase.value;

      if (newSSID.length === 0 || newPassphrase.length === 0) return;

      this.psk = PBKDF2(newPassphrase, newSSID, { keySize: 8, iterations: 4096 }).toString();
    },
  },
  updated() {
    this.$refs.psk.focus();
    this.$refs.psk.setSelectionRange(0, 64);
  },
};
</script>
