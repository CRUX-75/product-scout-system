-- ===============================================
-- PRODUCT SCOUT SYSTEM - SAMPLE DATA
-- ===============================================

-- Insert sample products for testing
INSERT INTO products (name, description, category, source, source_url, status) VALUES
('Portable Neck Fan', 'Hands-free personal cooling device with adjustable speed', 'Personal Care', 'tiktok', 'https://tiktok.com/tag/neckfan', 'raw'),
('Phone Stand Adjustable', 'Foldable aluminum phone stand for desk use', 'Electronics Accessories', 'reddit', 'https://reddit.com/r/dropship/portable_stand', 'raw'),
('Silicone Ice Cube Trays', 'Flexible silicone trays for easy ice removal', 'Kitchen', 'google_trends', 'https://trends.google.com/kitchen_accessories', 'filtered'),
('LED Strip Lights RGB', 'Color-changing LED strips with remote control', 'Home Decor', 'amazon', 'https://amazon.com/led-strips', 'filtered'),
('Yoga Mat Non-Slip', 'Eco-friendly yoga mat with alignment guides', 'Fitness', 'tiktok', 'https://tiktok.com/tag/yogamat', 'classified'),
('Car Phone Mount', 'Magnetic phone holder for car dashboard', 'Auto Accessories', 'reddit', 'https://reddit.com/r/tiktokmademebuyit/car_mount', 'classified'),
('Resistance Bands Set', 'Set of 5 resistance bands for home workouts', 'Fitness', 'google_trends', 'https://trends.google.com/fitness_equipment', 'scored'),
('Essential Oil Diffuser', 'Ultrasonic aromatherapy diffuser with timer', 'Home & Garden', 'amazon', 'https://amazon.com/oil-diffuser', 'scored');

-- Insert trend data
INSERT INTO product_trends (product_id, trend_score, mentions_count, velocity_7d, velocity_30d, search_volume, social_sentiment) VALUES
(1, 85.5, 450, 25.3, 15.7, 8500, 0.7),
(2, 72.3, 320, 12.4, 8.9, 5200, 0.5),
(3, 45.8, 180, -5.2, 2.1, 3400, 0.2),
(4, 65.4, 280, 18.9, 22.3, 6700, 0.6),
(5, 78.9, 390, 28.1, 19.4, 7800, 0.8),
(6, 56.7, 220, 8.3, 5.6, 4100, 0.4),
(7, 69.2, 310, 15.7, 11.2, 5900, 0.6),
(8, 52.1, 190, 3.4, 1.8, 3800, 0.3);

-- Insert validation data
INSERT INTO product_validations (product_id, compliance_eu, size_valid, trademark_check, category_allowed, weight_kg, dimensions_cm) VALUES
(1, true, true, true, true, 0.3, '15x10x5'),
(2, true, true, true, true, 0.2, '20x15x3'),
(3, true, true, true, false, 0.4, '25x15x8'),
(4, false, false, true, false, 0.8, '500x2x1'),
(5, true, true, true, true, 1.2, '180x60x1'),
(6, true, true, true, true, 0.1, '8x5x2'),
(7, true, true, true, true, 0.5, '30x20x10'),
(8, true, false, true, true, 1.5, '25x25x20');

-- Insert classification data
INSERT INTO product_classifications (product_id, bucket, confidence, ai_reasoning, keywords, target_audience, seasonality_months) VALUES
(1, 'seasonal', 0.85, 'High demand during summer months, cooling-related product', '["cooling", "summer", "personal", "portable"]', 'Office workers, outdoor enthusiasts', '[5,6,7,8,9]'),
(2, '4season', 0.92, 'Universal phone accessory with year-round demand', '["phone", "stand", "desk", "work"]', 'Remote workers, students, professionals', '[1,2,3,4,5,6,7,8,9,10,11,12]'),
(3, 'problemloser', 0.75, 'Solves specific kitchen problem of ice removal', '["ice", "kitchen", "easy", "flexible"]', 'Home cooks, cocktail enthusiasts', '[1,2,3,4,5,6,7,8,9,10,11,12]'),
(4, 'hype', 0.70, 'Trending home decor item with viral potential', '["led", "lights", "rgb", "mood"]', 'Young adults, gamers, content creators', '[1,2,3,4,5,6,7,8,9,10,11,12]'),
(5, '4season', 0.88, 'Fitness equipment with consistent demand', '["yoga", "fitness", "exercise", "home"]', 'Fitness enthusiasts, yoga practitioners', '[1,2,3,4,5,6,7,8,9,10,11,12]'),
(6, '4season', 0.90, 'Essential car accessory with universal appeal', '["car", "phone", "safety", "navigation"]', 'Car owners, commuters, delivery drivers', '[1,2,3,4,5,6,7,8,9,10,11,12]'),
(7, 'problemloser', 0.82, 'Home fitness solution, especially relevant post-pandemic', '["fitness", "home", "strength", "resistance"]', 'Fitness enthusiasts, home workout crowd', '[1,2,3,4,5,6,7,8,9,10,11,12]'),
(8, '4season', 0.76, 'Wellness product with steady demand', '["aromatherapy", "wellness", "relaxation", "home"]', 'Wellness enthusiasts, stress relief seekers', '[1,2,3,4,5,6,7,8,9,10,11,12]');

-- Insert scoring data
INSERT INTO product_scores (product_id, opportunity_score, trend_weight, margin_potential, search_demand, competition_penalty, logistics_penalty) VALUES
(1, 78.5, 25.65, 19.625, 17.0, -11.34, -2.415),
(2, 72.3, 21.69, 22.075, 10.4, -8.505, -1.16),
(3, 45.8, 13.74, 15.225, 6.8, -12.76, -2.32),
(4, 58.4, 19.62, 16.35, 13.4, -18.45, -4.64),
(5, 81.2, 23.67, 24.25, 15.6, -9.45, -6.96),
(6, 69.7, 17.01, 20.9, 8.2, -6.765, -0.58),
(7, 75.1, 20.76, 21.475, 11.8, -8.855, -2.9),
(8, 52.1, 15.63, 17.8, 7.6, -9.12, -8.7);

-- Insert research data
INSERT INTO product_research (product_id, amazon_price, amazon_reviews_count, amazon_rating, supplier_price, estimated_margin, shipping_cost_de, lead_time_days, competition_ads_count) VALUES
(1, 29.99, 1250, 4.2, 8.50, 65.5, 4.20, 12, 23),
(2, 24.99, 890, 4.5, 6.20, 72.1, 2.80, 8, 15),
(3, 12.99, 340, 3.8, 3.40, 68.4, 3.10, 10, 8),
(4, 39.99, 2100, 4.1, 12.80, 58.2, 5.60, 14, 45),
(5, 49.99, 1680, 4.6, 18.50, 55.1, 8.40, 16, 28),
(6, 19.99, 560, 4.3, 4.80, 73.2, 1.90, 7, 12),
(7, 34.99, 920, 4.4, 9.20, 69.8, 3.50, 9, 18),
(8, 44.99, 780, 4.0, 16.20, 58.4, 7.80, 15, 22);

-- Insert sample HIL evaluations
INSERT INTO hil_evaluations (product_id, margin_score, problem_score, wow_score, ad_potential_score, seasonal_score, decision, notes, evaluated_by) VALUES
(1, 4, 5, 4, 5, 2, 'test', 'Great summer product, high viral potential on TikTok. Consider testing in Q2.', 'CEO'),
(2, 5, 3, 3, 3, 5, 'test', 'Solid margins, evergreen product. Good for stable revenue stream.', 'CEO'),
(5, 3, 4, 3, 4, 5, 'maybe', 'Competitive market but good fundamentals. Monitor for 2 weeks.', 'CEO'),
(6, 5, 4, 3, 4, 5, 'test', 'Excellent margins and universal need. High confidence for success.', 'CEO');

-- Insert a sample weekly report
INSERT INTO weekly_reports (week_start, week_end, products_processed, products_filtered, products_classified, products_scored, hil_evaluations_completed, top_products, key_insights, trending_categories) VALUES
(
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE,
    156,
    89,
    45,
    32,
    8,
    '[{"id": 1, "score": 78.5, "name": "Portable Neck Fan"}, {"id": 5, "score": 81.2, "name": "Yoga Mat Non-Slip"}, {"id": 7, "score": 75.1, "name": "Resistance Bands Set"}]',
    'Strong trend toward personal wellness and remote work accessories. Summer cooling products showing early traction.',
    '["Personal Care", "Fitness", "Electronics Accessories"]'
);

COMMENT ON TABLE products IS 'Sample data loaded for development and testing';
