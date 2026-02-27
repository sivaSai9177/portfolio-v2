import { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitText } from '../../lib/splitText';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const contactRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const messageFieldRef = useRef<HTMLTextAreaElement>(null);
  const charCountRef = useRef<HTMLSpanElement>(null);

  const [charCount, setCharCount] = useState(0);
  const [isCharCountWarning, setIsCharCountWarning] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [buttonSending, setButtonSending] = useState(false);
  const [buttonSent, setButtonSent] = useState(false);

  // Initialize EmailJS (using npm package directly — no CDN script needed)
  useEffect(() => {
    emailjs.init({ publicKey: 'Zew0sEqv4Z3RrmSlt' });
  }, []);

  // Contact section animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial hidden states for social buttons
      gsap.set('.social-btn', { opacity: 0, y: 20 });

      // Section label char reveal
      const contactLabel = document.querySelector('.contact-label .reveal-heading');
      if (contactLabel) {
        const chars = splitText(contactLabel as HTMLElement, 'char');
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.5,
          stagger: 0.02,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Heading — word clip reveal
      const contactHeading = document.querySelector('.contact-heading');
      if (contactHeading) {
        const text = contactHeading.textContent?.trim() || '';
        contactHeading.innerHTML = '';
        contactHeading.setAttribute('aria-label', text);

        const wordEls: HTMLElement[] = [];
        text.split(/\s+/).forEach((word, i, arr) => {
          const clip = document.createElement('span');
          clip.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
          const inner = document.createElement('span');
          inner.className = 'word-inner';
          inner.textContent = word;
          inner.style.cssText = 'display:inline-block;will-change:transform;';
          clip.appendChild(inner);
          contactHeading.appendChild(clip);
          wordEls.push(inner);
          if (i < arr.length - 1) {
            contactHeading.appendChild(document.createTextNode('\u00A0'));
          }
        });

        gsap.set(wordEls, { yPercent: 110 });
        gsap.to(wordEls, {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Sub text
      const contactSub = document.querySelector('.contact-sub');
      if (contactSub) {
        gsap.set(contactSub, { opacity: 0, y: 20 });
        gsap.to(contactSub, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.contact',
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Form header
      const formHeader = document.querySelector('.email-form-header');
      if (formHeader) {
        gsap.set(formHeader, { opacity: 0, y: 15 });
        gsap.to(formHeader, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.email-form',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Form fields
      gsap.set('[data-field]', { opacity: 0, y: 25 });
      gsap.to('[data-field]', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.email-form',
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });

      // Send button
      gsap.set('.email-send-btn', { opacity: 0, y: 20 });
      gsap.to('.email-send-btn', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: '.email-form',
          start: 'top 65%',
          toggleActions: 'play none none reverse',
        },
      });

      // Contact info cards
      gsap.set('.contact-info-row .contact-card', { opacity: 0, y: 20 });
      gsap.to('.contact-info-row .contact-card', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.contact-info-row',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      // Social buttons
      gsap.to('.social-btn', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: '.contact-social',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      // Magnetic send button
      const sendBtn = sendBtnRef.current;
      if (sendBtn) {
        sendBtn.addEventListener('mousemove', (e: MouseEvent) => {
          const rect = sendBtn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(sendBtn, {
            x: x * 0.15,
            y: y * 0.2,
            duration: 0.4,
            ease: 'power2.out',
          });
        });

        sendBtn.addEventListener('mouseleave', () => {
          gsap.to(sendBtn, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.4)',
          });
        });
      }
    }, contactRef);

    return () => ctx.revert();
  }, []);

  // Character counter
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const len = e.target.value.length;
    setCharCount(len);
    setIsCharCountWarning(len > 450);
  };

  // Particle burst effect
  const burstParticles = () => {
    if (!particlesRef.current) return;

    const colors = ['#f5a623', '#e09515', '#ffd700', '#ff8c00', '#2ecc71'];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('div');
      p.className = 'email-particle';
      p.style.background = colors[i % colors.length];
      const size = 4 + Math.random() * 5;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      particlesRef.current.appendChild(p);

      const angle = (Math.PI * 2 / 14) * i + (Math.random() * 0.5 - 0.25);
      const dist = 60 + Math.random() * 80;
      gsap.fromTo(
        p,
        { opacity: 1, x: 0, y: 0, scale: 1 },
        {
          opacity: 0,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          scale: 0,
          duration: 0.8 + Math.random() * 0.4,
          ease: 'power3.out',
          onComplete: () => p.remove(),
        }
      );
    }
  };

  // Show toast notification
  const displayToast = (message: string, isError: boolean) => {
    setToastMessage(message);
    setToastError(isError);
    setShowToast(true);

    if (toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'back.out(2)',
        }
      );

      gsap.to(toastRef.current, {
        opacity: 0,
        y: 40,
        delay: 3.5,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => setShowToast(false),
      });
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameField = (formRef.current?.elements.namedItem('name') as HTMLInputElement)?.value.trim() || '';
    const emailField = (formRef.current?.elements.namedItem('email') as HTMLInputElement)?.value.trim() || '';
    const messageField = (formRef.current?.elements.namedItem('message') as HTMLTextAreaElement)?.value.trim() || '';

    if (!nameField || !emailField || !messageField) return;

    setButtonSending(true);

    try {
      await emailjs.send('service_9aim4u7', 'template_j6zq3nd', {
        from_name: nameField,
        from_email: emailField,
        message: messageField,
        to_name: 'Siva Sai',
      });

      // Success
      setButtonSending(false);
      setButtonSent(true);

      burstParticles();
      displayToast("Message sent! I'll get back to you soon.", false);

      // Reset form
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.reset();
        }
        setCharCount(0);
        setButtonSent(false);
      }, 4000);
    } catch (err: any) {
      console.error('EmailJS error:', err);
      setButtonSending(false);
      const msg = err?.text || err?.message || 'Unknown error';
      displayToast(`Failed to send: ${msg}`, true);
    }
  };

  return (
    <section className="contact" id="contact" data-section="dark" ref={contactRef}>
      <div className="contact-bento">
        {/* Intro card */}
        <div className="contact-intro">
          <div className="contact-accent-bar"></div>
          <div className="contact-intro-body">
            <img
              src="https://img.icons8.com/3d-fluency/200/handshake.png"
              alt="Let's connect"
              className="contact-greeting-img"
            />
            <div className="contact-label">
              <span className="material-icons-round">chat_bubble</span>
              <span className="reveal-heading">Get In Touch</span>
            </div>
            <h2 className="contact-heading reveal-heading">Let's build something together.</h2>
            <p className="contact-sub reveal-text">
              Open to frontend roles, freelance projects, and interesting collaborations. Let's create something
              meaningful.
            </p>
          </div>
        </div>

        {/* Email form */}
        <div className="email-form-wrapper">
          <form className="email-form" ref={formRef} onSubmit={handleSubmit} autoComplete="off">
            <div className="email-form-header">
              <span className="material-icons-round">mail</span>
              <span>Drop a Message</span>
            </div>

            <div className="email-field" data-field>
              <input type="text" id="efName" name="name" className="email-input" required placeholder=" " />
              <label htmlFor="efName" className="email-label">
                Your Name
              </label>
              <div className="email-input-line"></div>
            </div>

            <div className="email-field" data-field>
              <input
                type="email"
                id="efEmail"
                name="email"
                className="email-input"
                required
                placeholder=" "
              />
              <label htmlFor="efEmail" className="email-label">
                Your Email
              </label>
              <div className="email-input-line"></div>
            </div>

            <div className="email-field" data-field>
              <textarea
                id="efMessage"
                name="message"
                className="email-input email-textarea"
                required
                placeholder=" "
                rows={3}
                maxLength={500}
                ref={messageFieldRef}
                onChange={handleMessageChange}
              ></textarea>
              <label htmlFor="efMessage" className="email-label">
                Message
              </label>
              <div className="email-input-line"></div>
              <span className={`email-char-count ${isCharCountWarning ? 'warn' : ''}`}>
                <span>{charCount}</span>/500
              </span>
            </div>

            <button
              type="submit"
              className={`email-send-btn ${buttonSending ? 'sending' : ''} ${buttonSent ? 'sent' : ''}`}
              id="emailSendBtn"
              ref={sendBtnRef}
            >
              <span className="email-send-text">Send Message</span>
              <span className="material-icons-round email-send-icon">send</span>
              <span className="email-send-loader"></span>
              <div className="email-particles" id="emailParticles" ref={particlesRef}></div>
            </button>
          </form>
        </div>

        {/* Contact info row */}
        <div className="contact-info-row">
          <a href="mailto:sirigirisiva1@gmail.com" className="contact-card">
            <span className="contact-card-badge">
              <span className="material-icons-round">email</span>
            </span>
            <div className="contact-card-info">
              <span className="contact-card-label">Email</span>
              <span className="contact-card-value">sirigirisiva1@gmail.com</span>
            </div>
          </a>
          <a href="tel:+919177777922" className="contact-card">
            <span className="contact-card-badge">
              <span className="material-icons-round">phone</span>
            </span>
            <div className="contact-card-info">
              <span className="contact-card-label">Phone</span>
              <span className="contact-card-value">+91 917 777 7922</span>
            </div>
          </a>
          <div className="contact-card">
            <span className="contact-card-badge">
              <span className="material-icons-round">location_on</span>
            </span>
            <div className="contact-card-info">
              <span className="contact-card-label">Location</span>
              <span className="contact-card-value">Bengaluru, Karnataka</span>
            </div>
          </div>
        </div>

        {/* Email toast notification */}
        <div
          className={`email-toast ${toastError ? 'error' : ''} ${showToast ? 'show' : ''}`}
          id="emailToast"
          ref={toastRef}
        >
          <span className="material-icons-round email-toast-icon">
            {toastError ? 'error' : 'check_circle'}
          </span>
          <span className="email-toast-text">{toastMessage}</span>
        </div>

        {/* Social buttons */}
        <div className="contact-social">
          <a href="https://github.com/sivaSai9177" target="_blank" rel="noopener noreferrer" className="social-btn">
            <span className="material-icons-round">code</span> GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/sirigiri-siva-sai-b92841171/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <span className="material-icons-round">work</span> LinkedIn
          </a>
          <a href="#" className="social-btn social-btn--accent">
            <span className="material-icons-round">download</span> Download CV
          </a>
        </div>
      </div>
    </section>
  );
}
