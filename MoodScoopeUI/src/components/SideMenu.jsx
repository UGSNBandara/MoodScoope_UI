import React, { useEffect, useState, useRef } from 'react';
import IceCreamCard from './IceCreamCard';
import CategoryCard from './CategoryCard';
import './SideMenu.css';
import { getCatalog } from '../data/catalogClient';
import { useMood } from '../context/MoodContext';

const SideMenu = ({ data: fallbackData = [] }) => {
  const [catalog, setCatalog] = useState(null);
  // selectedCategory is managed by MoodContext so other components can control it
  const { selectedCategory, setSelectedCategory, jumpTarget, setJumpTarget } = useMood();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCatalog()
      .then((c) => {
        if (!mounted) return;
        setCatalog(c);
      })
      .catch((err) => {
        console.error('Catalog load failed, using fallback', err);
        setCatalog(null);
      })
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, []);

  const categories = catalog || [{ category: { name: 'Menu' }, items: fallbackData }];
  const items = categories[selectedCategory]?.items || [];

  const [animating, setAnimating] = useState(false);
  const [displayedSelected, setDisplayedSelected] = useState(selectedCategory);

  const itemsContainerRef = useRef(null);
  const slideContainerRef = useRef(null);

  // When selectedCategory changes (from anywhere), animate: slide-out current, update displayedSelected, then slide-in new
  useEffect(() => {
    if (displayedSelected === selectedCategory) return; // nothing to do
    // start slide-out
    setAnimating(true);
    const slideOutDuration = 240;
    const slideInDelay = 260;
    setTimeout(() => {
      // swap displayed content
      setDisplayedSelected(selectedCategory);
      // after swap, remove animating to allow slide-in class
      setTimeout(() => setAnimating(false), slideInDelay);
    }, slideOutDuration);
  }, [selectedCategory, displayedSelected]);

  // react to jumpTarget: select category, then perform bounce + sequential pop/scroll to item
  useEffect(() => {
    if (!jumpTarget) return;
    const { categoryIndex, itemIndex } = jumpTarget;
    // set the category (this will animate via the effect above)
    setSelectedCategory(categoryIndex);

    // after the displayedSelected updates and animation completes, run the sequence
    const totalDelay = 240 + 300; // slideOut + slideIn buffer
    setTimeout(() => {
      if (!itemsContainerRef.current) return;
      const cards = itemsContainerRef.current.querySelectorAll('.icecream-card');

      // bounce slide container briefly
      if (slideContainerRef.current) {
        slideContainerRef.current.classList.add('bounce-down');
        setTimeout(() => slideContainerRef.current && slideContainerRef.current.classList.remove('bounce-down'), 520);
      }

      // sequentially pop and scroll one-by-one toward the target
      (async () => {
            const popDuration = 1400; // ms per pop animation (1.4s) - increased for a slower, more noticeable pop
            const pauseBetween = 600; // ms pause between pops (0.6s)
        // make sure the first card is visible so its pop is noticeable
        if (cards.length > 0) {
          try { cards[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { }
          // small wait so scroll has a chance to start
              // eslint-disable-next-line no-await-in-loop
              await new Promise((res) => setTimeout(res, 160));
        }

        for (let i = 0; i <= itemIndex && i < cards.length; i++) {
          const card = cards[i];
          if (!card) continue;
          // scroll this card into view
          try {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch (e) {
            /* ignore */
          }
          // apply pop
          card.classList.add('pop');
          // wait for pop to play
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => setTimeout(res, popDuration));
          // remove pop
          card.classList.remove('pop');
          // small pause before next
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => setTimeout(res, pauseBetween));
        }

        // ensure final target is centered
        const final = cards[itemIndex];
        if (final) final.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // clear jumpTarget after sequence
        setJumpTarget(null);
      })();
    }, totalDelay);
  }, [jumpTarget, setJumpTarget, setSelectedCategory]);

  return (
    <div className="side-menu-container">
      {/* Header: compact title and optional back button */}
      <div className="side-menu-header">
        {/* Menu button: always available and returns to categories; becomes active when viewing a category */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          <button className={"menu-button" + (selectedCategory !== null ? ' menu-button--active' : '')} onClick={() => setSelectedCategory(null)}>
            Category List
          </button>
        </div>
      </div>

      {/* Scrollable content: render categories or items inside the scroll container */}
      <div className="side-menu-scrollable-content">
        <div ref={slideContainerRef} className={"slide-container " + (animating ? 'slide-out' : 'slide-in')}>
          {loading && <div>Loading...</div>}

          {!loading && selectedCategory === null && (
            <div className="category-list">
              {categories.map((c, idx) => (
                <CategoryCard key={c.category?.id ?? idx} name={c.category?.name ?? `Category ${idx}`} description={c.category?.description} active={false} onClick={() => setSelectedCategory(idx)} />
              ))}
            </div>
          )}

          {!loading && selectedCategory !== null && (
            <div ref={itemsContainerRef}>
              {items.map((item, idx) => (
                <IceCreamCard key={(item.name || 'item') + idx} image={item.image} name={item.name} description={item.description} price={item.price} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideMenu;