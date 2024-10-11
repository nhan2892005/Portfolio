import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className='cta'>
      <p className='cta-text'>
        Get in touch with me? <br className='sm:block hidden' />
      </p>
      <Link to='/contact' className='btn'>
        Contact
      </Link>
    </section>
  );
};

export default CTA;
