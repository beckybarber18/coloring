// set the precision of the float values (necessary if using float)
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
precision mediump int;

// flag for using soft shadows
#define SOFT_SHADOWS 0

// define constant parameters
// EPS is for the precision issue
#define INFINITY 1.0e+12
#define EPS 1.0e-3

// define maximum recursion depth for rays
#define MAX_RECURSION 8

// define constants for scene setting
#define MAX_LIGHTS 10

// define texture types
#define NONE 0
#define CHECKERBOARD 1
#define MYSPECIAL 2

// define material types
#define BASICMATERIAL 1
#define PHONGMATERIAL 2
#define LAMBERTMATERIAL 3

// define reflect types - how to bounce rays
#define NONEREFLECT 1
#define MIRRORREFLECT 2
#define GLASSREFLECT 3

struct Shape {
  int shapeType;
  vec3 v1;
  vec3 v2;
  float rad;
};

struct Material {
  int materialType;
  vec3 color;
  float shininess;
  vec3 specular;

  int materialReflectType;
  float reflectivity;
  float refractionRatio;
  int special;
};

struct Object {
  Shape shape;
  Material material;
};

struct Light {
  vec3 position;
  vec3 color;
  float intensity;
  float attenuate;
};

struct Ray {
  vec3 origin;
  vec3 direction;
};

struct Intersection {
  vec3 position;
  vec3 normal;
};

// uniform
uniform mat4 uMVMatrix;
uniform int frame;
uniform float height;
uniform float width;
uniform vec3 camera;
uniform int numObjects;
uniform int numLights;
uniform Light lights[MAX_LIGHTS];
uniform vec3 objectNorm;

// varying
varying vec2 v_position;

// find then position some distance along a ray
vec3 rayGetOffset(Ray ray, float dist) {
  return ray.origin + (dist * ray.direction);
}

// if a newly found intersection is closer than the best found so far, record
// the new intersection and return true; otherwise leave the best as it was and
// return false.
bool chooseCloserIntersection(float dist, inout float best_dist,
                              inout Intersection intersect,
                              inout Intersection best_intersect) {
  if (best_dist <= dist)
    return false;
  best_dist = dist;
  best_intersect.position = intersect.position;
  best_intersect.normal = intersect.normal;
  return true;
}

// put any general convenience functions you want up here
// ----------- STUDENT CODE BEGIN ------------
// ----------- Our reference solution uses 114 lines of code.
// ----------- STUDENT CODE END ------------

// forward declaration
float rayIntersectScene(Ray ray, out Material out_mat,
                        out Intersection out_intersect);

// Plane
// this function can be used for plane, triangle, and box
float findIntersectionWithPlane(Ray ray, vec3 norm, float dist,
                                out Intersection intersect) {
  float a = dot(ray.direction, norm);
  float b = dot(ray.origin, norm) - dist;

  if (a < EPS && a > -EPS)
    return INFINITY;

  float len = -b / a;
  if (len < EPS)
    return INFINITY;

  intersect.position = rayGetOffset(ray, len);
  intersect.normal = norm;
  return len;
}

// Triangle
float findIntersectionWithTriangle(Ray ray, vec3 t1, vec3 t2, vec3 t3,
                                   out Intersection intersect) {
  // ----------- STUDENT CODE BEGIN ------------

  // find intersection with plane
  vec3 norm = normalize(cross(t2-t1, t3-t1));
  float dist = dot(t1, norm);
  float planeIntersect = findIntersectionWithPlane(ray, norm, dist, intersect);
  if (planeIntersect == INFINITY) return planeIntersect;

  // for each side, check that point is in triangle
  // side 1
  vec3 v1 = t1-ray.origin;
  vec3 v2 = t2-ray.origin;
  vec3 n1 = cross(v1, v2);
  n1 = normalize(n1);
  vec3 distVector1 = ray.origin - intersect.position;
  float dist1 = dot(distVector1, n1);
  if (dist1 < EPS) return INFINITY;

  // side 2
  v1 = t2-ray.origin;
  v2 = t3-ray.origin;
  vec3 n2 = cross(v1, v2);
  n2 = normalize(n2);
  vec3 distVector2 = ray.origin - intersect.position;
  float dist2 = dot(distVector2, n2);
  if (dist2 < EPS) return INFINITY;

  // side 3
  v1 = t3-ray.origin;
  v2 = t1-ray.origin;
  vec3 n3 = cross(v1, v2);
  n3 = normalize(n3);
  vec3 distVector3 = ray.origin - intersect.position;
  float dist3 = dot(distVector3, n3);
  if (dist3 < EPS) return INFINITY;
  
  return planeIntersect;
  // ----------- STUDENT CODE END ------------
}

// Sphere
float findIntersectionWithSphere(Ray ray, vec3 center, float radius,
                                 out Intersection intersect) {
  // ----------- STUDENT CODE BEGIN ------------

  // animation
  float k1 = 10.0;
  float k2 = 1.1;
  center.y += k1*abs(floor(float(frame)/k2) - float(frame)/k2);

  // geometric method to find intersection
  vec3 L = center - ray.origin;
  vec3 v = normalize(ray.direction);

  float t_ca = dot(L, v);
  if (t_ca < EPS) return INFINITY;

  float d_squared = dot(L,L) - (t_ca * t_ca);
  float r_squared = radius*radius;
  if (d_squared > r_squared) return INFINITY;

  float t_hc = sqrt(r_squared - d_squared);
  float t1 = t_ca - t_hc;
  float t2 = t_ca + t_hc;

  // return the closest intersection > EPS
  if (t1 > EPS) {
    intersect.position = rayGetOffset(ray, t1);
    intersect.normal = normalize(intersect.position - center);
    return t1;
  }
  else if (t2 > EPS) {
    intersect.position = rayGetOffset(ray, t2);
    intersect.normal = normalize(intersect.position - center);
    return t2;
  } 
  
  // currently reports no intersection
  return INFINITY;
  // ----------- STUDENT CODE END ------------
}

// check if a point is in the box with the given bounding points
bool inBox(vec3 point, vec3 pmin, vec3 pmax, int axis) {

  bool in_x = (point.x > pmin.x) && (point.x < pmax.x);
  bool in_y = (point.y > pmin.y) && (point.y < pmax.y);
  bool in_z = (point.z > pmin.z) && (point.z < pmax.z);

  // x-axis; check y and z coords
  if (axis == 0) return (in_y && in_z);

  // y-axis; check x and z coords
  if (axis == 1) return (in_x && in_z);

  // z-axis; check x and y coords
  if (axis == 2) return (in_x && in_y);

}

// Box
float findIntersectionWithBox(Ray ray, vec3 pmin, vec3 pmax,
                              out Intersection out_intersect) {
  // ----------- STUDENT CODE BEGIN ------------
  // pmin and pmax represent two bounding points of the box
  // pmin stores [xmin, ymin, zmin] and pmax stores [xmax, ymax, zmax]
  
  vec3 x = vec3(1.0,0.0,0.0);
  vec3 y = vec3(0.0,1.0,0.0);
  vec3 z = vec3(0.0,0.0,1.0);

  Intersection intersect;
  float best_dist = INFINITY;
  float dist;
  vec3 norm;

  // front face
  dist = findIntersectionWithPlane(ray, -z, dot(pmin, -z), intersect);
  if (inBox(intersect.position, pmin, pmax, 2))
    chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // back face
  dist = findIntersectionWithPlane(ray, z, dot(pmax, z), intersect);
  if (inBox(intersect.position, pmin, pmax, 2))
    chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // left face
  dist = findIntersectionWithPlane(ray, -x, dot(pmin, -x), intersect);
  if (inBox(intersect.position, pmin, pmax, 0))
    chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // right face
  dist = findIntersectionWithPlane(ray, x, dot(pmax, x), intersect);
  if (inBox(intersect.position, pmin, pmax, 0))
    chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // top face
  dist = findIntersectionWithPlane(ray, -y, dot(pmin, -y), intersect);
  if (inBox(intersect.position, pmin, pmax, 1))
    chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // bottom face
  dist = findIntersectionWithPlane(ray, y, dot(pmin, y), intersect);
  if (inBox(intersect.position, pmin, pmax, 1))
    chooseCloserIntersection(dist, best_dist, intersect, out_intersect);
  
  return best_dist;
  // ----------- STUDENT CODE END ------------
}

// Cylinder
float getIntersectOpenCylinder(Ray ray, vec3 center, vec3 axis, float len,
                               float rad, out Intersection intersect) {
  // ----------- STUDENT CODE BEGIN ------------

  // animation
  float k1 = 10.0;
  float k2 = 1.1;
  center.y += k1*abs(floor(float(frame)/k2) - float(frame)/k2);

  // use equation given in slides
  vec3 p_a = center;
  vec3 v_a = axis;
  float r = rad;
  vec3 p = ray.origin;
  vec3 v = ray.direction;
  vec3 delta_p = p - p_a;
  vec3 p1 = center;
  vec3 p2 = center + axis * len;

  // formulas from slides
  float A = pow(length(v - dot(v, v_a) * v_a), 2.0);
  float B = 2.0 * dot(v - dot(v, v_a) * v_a, delta_p - dot(delta_p, v_a) * v_a);
  float C = pow(length(delta_p - dot(delta_p, v_a) * v_a), 2.0) - pow(r, 2.0);

  // quad formula
  float t1 = (-B - sqrt(pow(B, 2.0) - 4.0*A*C))/(2.0*A);
  float t2 = (-B + sqrt(pow(B, 2.0) - 4.0*A*C))/(2.0*A);

  // return closest intersection point > EPS
  if (t1 > EPS) {
    vec3 q = rayGetOffset(ray, t1);
    if (dot(v_a, q - p1) > EPS && dot(v_a, q - p2) < -EPS) {
      intersect.position = q;

      vec3 l = q - center;
      float h = sqrt(pow(length(l), 2.0) - pow(length(r), 2.0));
      vec3 x = p_a + h * v_a;
      intersect.normal = normalize(q - x);

      return t1;
    }
  }

  if (t2 > EPS) {
    vec3 q = rayGetOffset(ray, t2);
    if (dot(v_a, q - p1) > EPS && dot(v_a, q - p2) < -EPS) {
      intersect.position = q;

      vec3 l = q - center;
      float h = sqrt(pow(length(l), 2.0) - pow(length(r), 2.0));
      vec3 x = p_a + h * v_a;
      intersect.normal = normalize(q - x);

      return t2;
    }
  } 
  
  // currently reports no intersection
  return INFINITY;
  // ----------- STUDENT CODE END ------------
}

float getIntersectDisc(Ray ray, vec3 center, vec3 norm, float rad,
                       out Intersection intersect) {
  // ----------- STUDENT CODE BEGIN ------------

  vec3 v_a = norm;
  float r = rad;
  vec3 p = center;

  // find intersection with plane
  float dist = findIntersectionWithPlane(ray, norm, dot(center, norm), intersect);

  vec3 q = rayGetOffset(ray, dist);

  // check if intersection is in the disk
  if (dot(v_a, q - p) > -EPS && dot(v_a, q - p) < EPS && 
    pow(length(q-p), 2.0) < pow(r,2.0)) {
      return dist;
  }

  // currently reports no intersection
  return INFINITY;
  // ----------- STUDENT CODE END ------------
}

float findIntersectionWithCylinder(Ray ray, vec3 center, vec3 apex,
                                   float radius,
                                   out Intersection out_intersect) {
  vec3 axis = apex - center;
  float len = length(axis);
  axis = normalize(axis);

  Intersection intersect;
  float best_dist = INFINITY;
  float dist;

  // -- infinite cylinder
  dist = getIntersectOpenCylinder(ray, center, axis, len, radius, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // -- two caps
  dist = getIntersectDisc(ray, center, -axis, radius, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);
  dist = getIntersectDisc(ray, apex, axis, radius, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);
  return best_dist;
}

// Cone
float getIntersectOpenCone(Ray ray, vec3 apex, vec3 axis, float len,
                           float radius, out Intersection intersect) {
  // ----------- STUDENT CODE BEGIN ------------

  // use formulas from slides
  vec3 p_a = apex;
  vec3 v_a = axis;
  float r = radius;
  float alpha = atan(r/len);
  vec3 p = ray.origin;
  vec3 v = ray.direction;
  vec3 delta_p = p - p_a;
  vec3 p1 = apex + axis * len;
  vec3 p2 = apex;
  
  float cos_squared = pow(cos(alpha), 2.0);
  float sin_squared = pow(sin(alpha), 2.0);
  vec3 vector1 = v - dot(v, v_a) * v_a;
  vec3 vector2 = delta_p - dot(delta_p, v_a) * v_a;


  float A = cos_squared * pow(length(vector1), 2.0) - 
            sin_squared * pow(dot(v, v_a), 2.0);
  float B = 2.0 * cos_squared * dot(vector1, vector2) -
            2.0 * sin_squared * dot(v, v_a) * dot(delta_p, v_a);
  float C = cos_squared * pow(length(vector2), 2.0) - 
            sin_squared * pow(dot(delta_p, v_a), 2.0);

  // quad formula
  float t1 = (-B - sqrt(pow(B, 2.0) - 4.0*A*C))/(2.0*A);
  float t2 = (-B + sqrt(pow(B, 2.0) - 4.0*A*C))/(2.0*A);

  // get the minimum
  float t = min(t1, t2);
  if (t < EPS) return INFINITY;

  vec3 q = rayGetOffset(ray, t);

  if (dot(v_a, q - p2) < EPS || dot(v_a, q - p1) > EPS)
    return INFINITY;

  // otherwise return intersection
  intersect.position = q;
  vec3 E = q-p_a;
  intersect.normal = normalize(E - ((length(E)/cos(alpha)) * axis));
  return t;

  // ----------- STUDENT CODE END ------------
}

float findIntersectionWithCone(Ray ray, vec3 center, vec3 apex, float radius,
                               out Intersection out_intersect) {
  vec3 axis = center - apex;
  float len = length(axis);
  axis = normalize(axis);

  // -- infinite cone
  Intersection intersect;
  float best_dist = INFINITY;
  float dist;

  // -- infinite cone
  dist = getIntersectOpenCone(ray, apex, axis, len, radius, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // -- caps
  dist = getIntersectDisc(ray, center, axis, radius, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  return best_dist;
}

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

vec3 calculateSpecialDiffuseColor(Material mat, vec3 posIntersection,
                                  vec3 normalVector) {
  // ----------- STUDENT CODE BEGIN ------------
  if (mat.special == CHECKERBOARD) {

    float tile_size = 8.0;

    // formula from slides
    posIntersection += EPS;
    float val = floor(posIntersection.x/tile_size) + floor(posIntersection.y/tile_size) 
      + floor(posIntersection.z/tile_size);
    if (mod(val, 2.0) == 0.0) {
      vec3 black = vec3(0.0,0.0,0.0);
      return black;
    }
    
  } else if (mat.special == MYSPECIAL) {

    // taken from https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
    // (github directory GLSL-Noise.md)
    vec3 p = posIntersection;
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y) * mat.color;
    
  }

  // If not a special material, just return material color.
  return mat.color;
  // ----------- STUDENT CODE END ------------
}

vec3 calculateDiffuseColor(Material mat, vec3 posIntersection,
                           vec3 normalVector) {
  // Special colors
  if (mat.special != NONE) {
    return calculateSpecialDiffuseColor(mat, posIntersection, normalVector);
  }
  return vec3(mat.color);
}

// check if position pos in in shadow with respect to a particular light.
// lightVec is the vector from that position to that light -- it is not
// normalized, so its length is the distance from the position to the light
bool pointInShadow(vec3 pos, vec3 lightVec) {
  // ----------- STUDENT CODE BEGIN ------------

  // cast ray from position to light and find dist
  Ray ray;
  ray.origin = pos + lightVec;
  ray.direction = -normalize(lightVec);
  float len = length(lightVec);

  // length of dist determines if point is in shadow
  Material hitMaterial;
  Intersection intersect;
  float dist = rayIntersectScene(ray, hitMaterial, intersect);

  if (abs(dist) > EPS && abs(dist) + EPS < len) return true;
  return false;
  // ----------- STUDENT CODE END ------------
}

// randomly sample (x,y,z) around source for soft shadows
vec3 randomSampleShadow(vec2 co) {
  const float PI = 3.1415926538;

  // random function taken from the suggested StackOverflow post
  // https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl

  // random number [-1,1]
  float u = fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  // random number [0,2pi]
  float theta = PI + PI * (fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453));

  // formula from slides
  float x = sqrt(1.0-pow(u,2.0)) * cos(theta);
  float y = sqrt(1.0-pow(u,2.0)) * sin(theta);
  float z = u;

  return vec3(x,y,z);

}


// use random sampling to compute a ratio that represents the
// fractional contribution of the light to the position pos.
// lightVec is the vector from that position to that light -- it is not
// normalized, so its length is the distance from the position to the light
float softShadowRatio(vec3 pos, vec3 lightVec) {
  // ----------- STUDENT CODE BEGIN ------------

  float count = 0.0;  
  const int k = 5;
  for (int i = 0; i < k; i++) {
    for (int j = 0; j < k; j++) {

      // Randomly Sample a new light ray around the original light 
      vec3 newLightVec = lightVec + 10.0 * randomSampleShadow(vec2(pos.x + float(i), pos.y + float(j)));
      if (!pointInShadow(pos, newLightVec)) count += 1.0; 
    }
  } 
  
  return count/float(k*k); 
  // ----------- STUDENT CODE END ------------
}

vec3 getLightContribution(Light light, Material mat, vec3 posIntersection,
                          vec3 normalVector, vec3 eyeVector, bool phongOnly,
                          vec3 diffuseColor) {
  vec3 lightVector = light.position - posIntersection;

  // check if point is in shadow with light vector
  // if (pointInShadow(posIntersection, lightVector)) {
  //   return vec3(0.0, 0.0, 0.0);
  // }

  // normalize the light vector for the computations below
  float pointShadowRatio = softShadowRatio(posIntersection, lightVector);
  float distToLight = length(lightVector);
  lightVector /= distToLight;

  if (mat.materialType == PHONGMATERIAL ||
      mat.materialType == LAMBERTMATERIAL) {
    vec3 contribution = vec3(0.0, 0.0, 0.0);

    // get light attenuation
    float attenuation = light.attenuate * distToLight;
    float diffuseIntensity =
        max(0.0, dot(normalVector, lightVector)) * light.intensity;

    // glass and mirror objects have specular highlights but no diffuse lighting
    if (!phongOnly) {
      contribution +=
          diffuseColor * diffuseIntensity * light.color / attenuation;
    }

    if (mat.materialType == PHONGMATERIAL) {
      // Start with just black by default (i.e. no Phong term contribution)
      vec3 phongTerm = vec3(0.0, 0.0, 0.0);
      // ----------- STUDENT CODE BEGIN ------------

      vec3 k_s = mat.specular;
      vec3 R = normalize(reflect(-lightVector, normalVector));
      vec3 V = eyeVector;
      float n = mat.shininess;
      float dot_product = max(EPS, dot(R, V));

      phongTerm = k_s * pow(dot_product, n) * light.intensity * light.color / attenuation;
      
      // ----------- STUDENT CODE END ------------
      contribution += phongTerm;
    }

    return contribution * pointShadowRatio;
  } else {
    return diffuseColor * pointShadowRatio;
  }
}

vec3 calculateColor(Material mat, vec3 posIntersection, vec3 normalVector,
                    vec3 eyeVector, bool phongOnly) {
  // The diffuse color of the material at the point of intersection
  // Needed to compute the color when accounting for the lights in the scene
  vec3 diffuseColor = calculateDiffuseColor(mat, posIntersection, normalVector);

  // color defaults to black when there are no lights
  vec3 outputColor = vec3(0.0, 0.0, 0.0);

  // Loop over the MAX_LIGHTS different lights, taking care not to exceed
  // numLights (GLSL restriction), and accumulate each light's contribution
  // to the point of intersection in the scene.
  // ----------- STUDENT CODE BEGIN ------------

  for (int i = 0; i < MAX_LIGHTS; i++) {

    if (i == numLights) break;

    vec3 lightCont = getLightContribution(lights[i], mat, posIntersection, normalVector, 
      eyeVector, phongOnly, diffuseColor);

    outputColor = outputColor + lightCont;

  }

  
  // Return diffuseColor by default, so you can see something for now.
  return outputColor;
  // ----------- STUDENT CODE END ------------
}

// find reflection or refraction direction (depending on material type)
vec3 calcReflectionVector(Material material, vec3 direction, vec3 normalVector,
                          bool isInsideObj) {
  if (material.materialReflectType == MIRRORREFLECT) {
    return reflect(direction, normalVector);
  }
  // If it's not mirror, then it is a refractive material like glass.
  // Compute the refraction direction.
  // See lecture 13 slide (lighting) on Snell's law.
  // The eta below is eta_i/eta_r.
  // ----------- STUDENT CODE BEGIN ------------
  float eta =
      (isInsideObj) ? 1.0 / material.refractionRatio : material.refractionRatio;

  // snell's law
  float cos_i = dot(normalVector, -direction);
  float cos_r = cos(asin(eta * sin(acos(cos_i))));
  
  vec3 T = (eta * cos_i - cos_r) * normalVector + eta * direction;

  // if greater than the cricial angle 
  if (acos(cos_i) - asin(1.0/eta) > EPS)
      return reflect(direction, normalVector);
  return T;

  // ----------- Our reference solution uses 5 lines of code.
  // Return mirror direction by default, so you can see something for now.
  // return reflect(direction, normalVector);
  // ----------- STUDENT CODE END ------------
}

vec3 traceRay(Ray ray) {
  // Accumulate the final color from tracing this ray into resColor.
  vec3 resColor = vec3(0.0, 0.0, 0.0);

  // Accumulate a weight from tracing this ray through different materials
  // based on their BRDFs. Initially all 1.0s (i.e. scales the initial ray's
  // RGB color by 1.0 across all color channels). This captures the BRDFs
  // of the materials intersected by the ray's journey through the scene.
  vec3 resWeight = vec3(1.0, 1.0, 1.0);

  // Flag for whether the ray is currently inside of an object.
  bool isInsideObj = false;

  // Iteratively trace the ray through the scene up to MAX_RECURSION bounces.
  for (int depth = 0; depth < MAX_RECURSION; depth++) {
    // Fire the ray into the scene and find an intersection, if one exists.
    //
    // To do so, trace the ray using the rayIntersectScene function, which
    // also accepts a Material struct and an Intersection struct to store
    // information about the point of intersection. The function returns
    // a distance of how far the ray travelled before it intersected an object.
    //
    // Then, check whether or not the ray actually intersected with the scene.
    // A ray does not intersect the scene if it intersects at a distance
    // "equal to zero" or far beyond the bounds of the scene. If so, break
    // the loop and do not trace the ray any further.
    // (Hint: You should probably use EPS and INFINITY.)
    // ----------- STUDENT CODE BEGIN ------------
    Material hitMaterial;
    Intersection intersect;

    float dist = rayIntersectScene(ray, hitMaterial, intersect);

    if (abs(dist) < EPS || abs(dist) > INFINITY) break;

    // ----------- STUDENT CODE END ------------

    // Compute the vector from the ray towards the intersection.
    vec3 posIntersection = intersect.position;
    vec3 normalVector    = intersect.normal;

    vec3 eyeVector = normalize(ray.origin - posIntersection);

    // Determine whether we are inside an object using the dot product
    // with the intersection's normal vector
    if (dot(eyeVector, normalVector) < 0.0) {
        normalVector = -normalVector;
        isInsideObj = true;
    } else {
        isInsideObj = false;
    }

    // Material is reflective if it is either mirror or glass in this assignment
    bool reflective = (hitMaterial.materialReflectType == MIRRORREFLECT ||
                       hitMaterial.materialReflectType == GLASSREFLECT);

    // Compute the color at the intersection point based on its material
    // and the lighting in the scene
    vec3 outputColor = calculateColor(hitMaterial, posIntersection,
      normalVector, eyeVector, reflective);

    // A material has a reflection type (as seen above) and a reflectivity
    // attribute. A reflectivity "equal to zero" indicates that the material
    // is neither reflective nor refractive.

    // If a material is neither reflective nor refractive...
    // (1) Scale the output color by the current weight and add it into
    //     the accumulated color.
    // (2) Then break the for loop (i.e. do not trace the ray any further).
    // ----------- STUDENT CODE BEGIN ------------
    if (abs(hitMaterial.reflectivity) < EPS) {
      outputColor = outputColor * resWeight;
      resColor = resColor + outputColor;
      break;
    }
    // ----------- STUDENT CODE END ------------

    // If the material is reflective or refractive...
    // (1) Use calcReflectionVector to compute the direction of the next
    //     bounce of this ray.
    // (2) Update the ray object with the next starting position and
    //     direction to prepare for the next bounce. You should modify the
    //     ray's origin and direction attributes. Be sure to normalize the
    //     direction vector.
    // (3) Scale the output color by the current weight and add it into
    //     the accumulated color.
    // (4) Update the current weight using the material's reflectivity
    //     so that it is the appropriate weight for the next ray's color.
    // ----------- STUDENT CODE BEGIN ------------

    vec3 direction = calcReflectionVector(hitMaterial, ray.direction, normalVector,
      isInsideObj);

    ray.origin = posIntersection;
    ray.direction = normalize(direction);

    outputColor = outputColor * resWeight;
    resColor = resColor + outputColor;
    resWeight = resWeight * hitMaterial.reflectivity;

    // ----------- STUDENT CODE END ------------
  }

  return resColor;
}

void main() {
  float cameraFOV = 0.8;
  vec3 direction = vec3(v_position.x * cameraFOV * width / height,
                        v_position.y * cameraFOV, 1.0);

  Ray ray;
  ray.origin = vec3(uMVMatrix * vec4(camera, 1.0));
  ray.direction = normalize(vec3(uMVMatrix * vec4(direction, 0.0)));

  // trace the ray for this pixel
  vec3 res = traceRay(ray);

  // paint the resulting color into this pixel
  gl_FragColor = vec4(res.x, res.y, res.z, 1.0);
}
