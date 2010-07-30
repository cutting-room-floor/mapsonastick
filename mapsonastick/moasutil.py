import sqlite3, os, math

class SphericalMercator(object):
    """
    Python class defining Spherical Mercator Projection.
    
    Originally from:  
      http://svn.openstreetmap.org/applications/rendering/mapnik/generate_tiles.py
    """
    def __init__(self,levels=18,size=256):
        self.Bc = []
        self.Cc = []
        self.zc = []
        self.Ac = []
        self.DEG_TO_RAD = math.pi/180
        self.RAD_TO_DEG = 180/math.pi
        self.cache = {}
        self.size = size
        for d in range(0,levels):
            e = size/2.0;
            self.Bc.append(size/360.0)
            self.Cc.append(size/(2.0 * math.pi))
            self.zc.append((e,e))
            self.Ac.append(size)
            size *= 2.0

    @classmethod
    def minmax(a, b, c):
        a = max(a, b)
        a = min(a, c)
        return a

    def ll_to_px(self,px,zoom):
        """ convert a latitude, longitude pair to a pixel """
        d = self.zc[zoom]
        e = round(d[0] + px[0] * self.Bc[zoom])
        f = self.minmax(math.sin(DEG_TO_RAD * px[1]),-0.9999,0.9999)
        g = round(d[1] + 0.5 * math.log((1+f)/(1-f))*-self.Cc[zoom])
        return (e,g)
    
    def px_to_ll(self,px,zoom):
        """ Convert pixel postion to LatLong (EPSG:4326) """
        e = self.zc[zoom]
        f = (px[0] - e[0])/self.Bc[zoom]
        g = (px[1] - e[1])/-self.Cc[zoom]
        h = self.RAD_TO_DEG * ( 2 * math.atan(math.exp(g)) - 0.5 * math.pi)
        return (f,h)
    
    def xyz_to_envelope(self,x,y,zoom, tms_style=False):
        """ Convert XYZ to mapnik.Envelope """
        if tms_style:
            y = (2**zoom-1) - y
        ll = (x * self.size,(y + 1) * self.size)
        ur = ((x + 1) * self.size, y * self.size)
        minx,miny = self.px_to_ll(ll,zoom)
        maxx,maxy = self.px_to_ll(ur,zoom)
        return (minx,miny,maxx,maxy)

def restrictions(db):
    """ return bounding box and min/max zoom levels """
    if not os.path.isfile(db):
        return "Map file not found: %s" % db
    try:
        conn = sqlite3.connect(db)
    except Exception, e:
        return "Problem connecting to tileset: %s" % str(e)

    max_zoom_q = conn.execute("select max(zoom_level) from tiles;")
    max_zoom = max_zoom_q.fetchone()[0]

    min_zoom_q = conn.execute("select min(zoom_level) from tiles;")
    min_zoom = min_zoom_q.fetchone()[0]

    min_w_q = conn.execute("select min(tile_column) from tiles where zoom_level='%s';" % max_zoom)
    min_w = min_w_q.fetchone()[0]

    min_n_q = conn.execute("select min(tile_row) from tiles where zoom_level='%s';" % max_zoom)
    min_n = min_n_q.fetchone()[0]

    min_s_q = conn.execute("select max(tile_row) from tiles where zoom_level='%s';" % max_zoom)
    min_s = min_s_q.fetchone()[0]

    min_e_q = conn.execute("select max(tile_column) from tiles where zoom_level='%s';" % max_zoom)
    min_e = min_e_q.fetchone()[0]

    sm = SphericalMercator(levels=18)
    env_nw = sm.xyz_to_envelope(min_w, min_n, max_zoom, tms_style = True)
    env_se = sm.xyz_to_envelope(min_e, min_s, max_zoom, tms_style = True)
    return {
      'bounds': [env_se[0], env_nw[1], env_nw[0], env_se[1]],
      'zooms': [min_zoom, max_zoom]
    }
