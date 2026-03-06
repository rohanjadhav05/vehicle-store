package com.vehicle.store.service;

import com.vehicle.store.entity.Brand;
import com.vehicle.store.exception.DuplicateResourceException;
import com.vehicle.store.exception.ResourceNotFoundException;
import com.vehicle.store.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand createBrand(Brand brand) {
        if (brandRepository.existsByName(brand.getName())) {
            throw new DuplicateResourceException("Brand already exists with name: " + brand.getName());
        }
        return brandRepository.save(brand);
    }

    public void deleteBrand(Long id) {
        if (!brandRepository.existsById(id)) {
            throw new ResourceNotFoundException("Brand not found with id: " + id);
        }
        brandRepository.deleteById(id);
    }
}
