import urllib.request
import urllib.error
import json

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models import ServiceArea


def _point_in_polygon(lat, lng, polygon):
    """
    Ray-casting algorithm. polygon is a list of {"lat": float, "lng": float} dicts.
    Returns True if the point (lat, lng) is inside the polygon.
    """
    n = len(polygon)
    if n < 3:
        return False
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]['lng'], polygon[i]['lat']
        xj, yj = polygon[j]['lng'], polygon[j]['lat']
        if ((yi > lat) != (yj > lat)) and (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def _geocode_postcode(postcode):
    """
    Geocode a UK postcode using the free postcodes.io API.
    Returns (lat, lng) or raises ValueError if the postcode is invalid.
    Raises urllib.error.URLError if the service is unreachable.
    """
    clean = postcode.replace(' ', '').upper()
    url = f"https://api.postcodes.io/postcodes/{clean}"
    with urllib.request.urlopen(url, timeout=5) as resp:
        data = json.loads(resp.read())
    if data.get('status') != 200 or not data.get('result'):
        raise ValueError(f"Invalid or unknown postcode: {postcode}")
    result = data['result']
    return result['latitude'], result['longitude']


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticatedOrReadOnly])
def service_area_detail(request):
    area = ServiceArea.get()

    if request.method == 'GET':
        return Response({'polygon': area.polygon, 'updated_at': area.updated_at})

    # PATCH — staff only
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({'error': 'Staff access required.'}, status=403)

    polygon = request.data.get('polygon')
    if not isinstance(polygon, list):
        return Response({'error': 'polygon must be a list of {lat, lng} objects.'}, status=400)

    area.polygon = polygon
    area.save()
    return Response({'polygon': area.polygon, 'updated_at': area.updated_at})


@api_view(['POST'])
@permission_classes([AllowAny])
def service_area_check(request):
    postcode = request.data.get('postcode', '').strip()
    if not postcode:
        return Response({'error': 'postcode is required.'}, status=400)

    try:
        lat, lng = _geocode_postcode(postcode)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)
    except Exception:
        return Response({'error': 'Postcode lookup service unavailable. Please try again.'}, status=503)

    area = ServiceArea.get()
    is_within = _point_in_polygon(lat, lng, area.polygon)

    return Response({
        'postcode': postcode,
        'lat': lat,
        'lng': lng,
        'is_within_zone': is_within,
    })
