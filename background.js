/**
 * Mon Mega Hub - Background Service Worker
 */

const SUPABASE_URL = "https://mveepfuvayqpwifixjuw.supabase.co";
const TMDB_API_KEY = "901813b968aab358d75aa6dff9ace272";

// Listener pour les messages du content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received:', request);

    if (['watchlist', 'compare', 'finder'].includes(request.action)) {
        handleHubAction(request);
    }
});

async function handleHubAction(data) {
    const hubBaseUrl = "http://localhost:3000";

    if (data.action === 'watchlist') {
        const item = await searchTMDB(data.title);

        if (!item) {
            showIOSNotification("Erreur", `Impossible de trouver "${data.title}" sur TMDB.`);
            return;
        }

        const token = await getSupabaseSession();
        if (!token) {
            showIOSNotification("Connexion requise", "Veuillez vous connecter au Hub pour gérer votre liste.");
            chrome.tabs.create({ url: hubBaseUrl });
            return;
        }

        await addToSupabaseWatchlist(item, token);
    } else if (data.action === 'compare') {
        chrome.tabs.create({ url: `${hubBaseUrl}/compare?item1=${encodeURIComponent(data.title)}` });
    } else if (data.action === 'finder') {
        chrome.tabs.create({ url: `${hubBaseUrl}/finder?q=${encodeURIComponent(data.title)}` });
    }
}

async function searchTMDB(query) {
    try {
        // Recherche multi (films et séries)
        const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=fr-FR`);
        const data = await response.json();
        const results = data.results || [];

        // On prend le premier résultat qui est un film ou une série
        return results.find(r => ['movie', 'tv'].includes(r.media_type));
    } catch (e) {
        console.error('TMDB Search Error:', e);
        return null;
    }
}

async function addToSupabaseWatchlist(item, token) {
    try {
        const userId = await getUserIdFromToken(token);
        if (!userId) {
            console.error('No user ID found for token');
            return false;
        }

        const tmdbId = item.id;
        console.log('Hub: Item found on TMDB:', item.title || item.name, 'ID:', tmdbId);

        // 1. Détection Anime (JP + Animation) - Comme sur le site
        let mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
        const isJapanese = item.origin_country?.includes('JP') || item.original_language === 'ja';
        const genres = item.genres || [];
        const hasAnimation = item.genre_ids?.includes(16) || genres.some(g => (typeof g === 'string' ? g : g.name) === 'Animation' || g.id === 16);

        if (mediaType === 'tv' && isJapanese && hasAnimation) {
            mediaType = 'anime';
        }
        console.log('Hub: Detected media type:', mediaType);

        console.log('Hub: Checking if item already exists...');
        // 2. Vérifier si l'élément existe déjà (Toggle logic)
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/watchlist?user_id=eq.${userId}&tmdb_id=eq.${tmdbId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': "sb_publishable_v3rugbEOCtrLKsSyVgNYhg_9xFz-VZa"
            }
        });

        if (!checkResponse.ok) {
            const err = await checkResponse.text();
            console.error('Hub: Supabase check failed:', err);
            showIOSNotification("Erreur", "Impossible de vérifier l'état de la liste.");
            return false;
        }

        const existingItems = await checkResponse.json();
        console.log('Hub: Existing items count:', existingItems.length);

        if (existingItems && existingItems.length > 0) {
            console.log('Hub: Item exists, removing...');
            // SUPPRIMER (Toggle off)
            const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/watchlist?user_id=eq.${userId}&tmdb_id=eq.${tmdbId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': "sb_publishable_v3rugbEOCtrLKsSyVgNYhg_9xFz-VZa"
                }
            });
            if (deleteResponse.ok) {
                console.log('Hub: Successfully removed from watchlist');
                showIOSNotification("Retiré", `"${item.title || item.name}" retiré de votre liste.`);
                return true;
            } else {
                console.error('Hub: Delete failed:', await deleteResponse.text());
            }
        } else {
            console.log('Hub: Item does not exist, adding...');
            // AJOUTER (Toggle on)
            const payload = {
                user_id: userId,
                tmdb_id: tmdbId,
                type: mediaType,
                title: item.title || item.name,
                poster_path: item.poster_path,
                vote_average: item.vote_average ? String(item.vote_average) : "0" // Forcer en string si nécessaire pour la BDD
            };
            console.log('Hub: Insertion payload:', payload);

            const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/watchlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'apikey': "sb_publishable_v3rugbEOCtrLKsSyVgNYhg_9xFz-VZa",
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(payload)
            });

            if (insertResponse.ok) {
                console.log('Hub: Successfully added to watchlist');
                showIOSNotification("SUIVI", `"${item.title || item.name}" ajouté à votre liste.`);
                return true;
            } else {
                const errorLog = await insertResponse.text();
                console.error('Hub: Supabase Insert Error Log:', errorLog);
                showIOSNotification("Erreur", "Problème technique lors de l'ajout.");
            }
        }
        return false;
    } catch (e) {
        console.error('Hub: Supabase Watchlist Exception:', e);
        return false;
    }
}

async function getUserIdFromToken(token) {
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': "sb_publishable_v3rugbEOCtrLKsSyVgNYhg_9xFz-VZa"
            }
        });
        const data = await response.json();
        return data.id;
    } catch (e) {
        return null;
    }
}

function showIOSNotification(title, message) {
    if (typeof chrome !== 'undefined' && chrome.notifications) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icon128.png',
            title: title,
            message: message,
            priority: 2
        });
    } else {
        console.warn('Notifications API not available');
    }
}

// Alarme pour les notifications de l'agenda ou watchlist
chrome.alarms.create('checkNotifications', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkNotifications') {
        checkHubUpdates();
    }
});

async function checkHubUpdates() {
    console.log('Checking Hub updates...');
    const token = await getSupabaseSession();
    if (!token) {
        console.log('No active session found.');
        return;
    }

    // Logique de polling Supabase avec le token de session
    // Exemple: fetch(`${SUPABASE_URL}/rest/v1/agenda?select=*`, { headers: { 'Authorization': `Bearer ${token}` } })
}

async function getSupabaseSession() {
    const COOKIE_NAME = "sb-mveepfuvayqpwifixjuw-auth-token";
    const DOMAINS = ["localhost", "mon-mega-hub.vercel.app"];

    for (const domain of DOMAINS) {
        const session = await new Promise((resolve) => {
            chrome.cookies.get({
                url: domain.includes('localhost') ? `http://${domain}:3000` : `https://${domain}`,
                name: COOKIE_NAME
            }, (cookie) => {
                if (cookie) {
                    try {
                        const data = JSON.parse(decodeURIComponent(cookie.value));
                        // Supabase SSR cookies can be an array or a single object
                        const token = Array.isArray(data) ? data[0]?.access_token : data?.access_token;
                        resolve(token);
                    } catch (e) {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });

        if (session) return session;
    }

    // Fallback: search all cookies starting with sb- and ending with -auth-token
    return new Promise((resolve) => {
        chrome.cookies.getAll({}, (cookies) => {
            const authCookie = cookies.find(c => c.name.includes('auth-token') && c.name.startsWith('sb-'));
            if (authCookie) {
                try {
                    const data = JSON.parse(decodeURIComponent(authCookie.value));
                    const token = Array.isArray(data) ? data[0]?.access_token : data?.access_token;
                    resolve(token);
                } catch (e) {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    });
}
