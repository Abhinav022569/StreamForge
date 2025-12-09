import PipelineBuilder from './components/PipelineBuilder';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Custom ETL Pipeline Builder</h1>
      <p>Drag nodes to rearrange. Draw lines to connect them.</p>
      
      {/* Render our new component */}
      <PipelineBuilder />
    </div>
  );
}

export default App;