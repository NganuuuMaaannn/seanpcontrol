const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const XML_CONTENT = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.4.1</domain>
    </domain-config>
</network-security-config>`;

function withNetworkSecurityConfig(config) {
  // Copy the XML file
  config = withDangerousMod(config, [
    "android",
    (config) => {
      const xmlDir = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/res/xml"
      );
      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }
      fs.writeFileSync(path.join(xmlDir, "network_security_config.xml"), XML_CONTENT);
      return config;
    },
  ]);

  // Add to AndroidManifest
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    mainApplication["$"]["android:networkSecurityConfig"] =
      "@xml/network_security_config";
    return config;
  });

  return config;
}

module.exports = withNetworkSecurityConfig;
