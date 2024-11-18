import dynamic from 'next/dynamic';
import { RedocStandalone } from 'redoc';


export default function Docs() {
  return (
    <RedocStandalone
        specUrl="openai.json"
        options={{
            nativeScrollbars: true,
            theme: { colors: { primary: { main: '#dd5522' } }},
          }}
        
        />
  );
}
