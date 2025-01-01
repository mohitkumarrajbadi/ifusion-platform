import React from "react";

const PluginComponent = () => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}>
      <h3>Plugin 2</h3>
      <p>This is the Plugin 2 Component!</p>
      <button onClick={() => alert("Button clicked!")}>Click Me</button>
    </div>
  );
};

export default PluginComponent;
