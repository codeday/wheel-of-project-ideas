export { default } from '../index';

export function getServerSideProps({ params }) {
  return {
    props: {
      theme: params.theme
    }
  }  
}